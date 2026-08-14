import User from "../models/user.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import { asynchandler } from "../utils/asynchandler.js"
import { generateTokens, setAuthCookies, ACCESS_TOKEN_MAX_AGE, REFRESH_TOKEN_MAX_AGE } from "../utils/generateToken.js"
import jwt from "jsonwebtoken"
import uploadToCloudinary from "../utils/uploadToCloudinary.js"
import sendEmail from "../utils/sendEmail.js"
import { welcomeTemplate, otpTemplate } from "../utils/emailTemplates.js"
import generateOTP from "../utils/generateOTP.js"
import crypto from "crypto"
import { resetPasswordTemplate } from "../utils/emailTemplates.js"




// Cookie options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
}
//── Register User ────────────────────────────────────────
const registerUser = asynchandler(async (req, res) => {
  const { username, email, password } = req.body

  // Validation
  if (!username || !email || !password) {
    const missingFields = []
    if (!username) missingFields.push("username")
    if (!email) missingFields.push("email")
    if (!password) missingFields.push("password")
    throw new ApiError(400, `All fields are required. Missing: ${missingFields.join(", ")}`)
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Invalid email format")
  }

  // Check if user exists
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw new ApiError(409, "Email already registered")
  }

  // Upload avatar
  let avatarUrl = ""
  if (req.file && req.file.buffer) {
    avatarUrl = await uploadToCloudinary(req.file.buffer, "avatars")
  }

  // Generate OTP
  const otp = generateOTP()
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

  // Create user — unverified
  const user = await User.create({
    username,
    email,
    password,
    avatar: avatarUrl,
    isVerified: false,
    otp,
    otpExpiry
  })

  // Send OTP email
  try {
    await sendEmail({
      to: email,
      subject: "Verify your BillSplit account",
      html: otpTemplate({ username, otp })
    })
  } catch (emailError) {
    // Delete user if email fails
    await User.findByIdAndDelete(user._id)
    throw new ApiError(500, "Failed to send verification email. Please try again.")
  }

  return res.status(201).json(
    new ApiResponse(201, { email }, "OTP sent to your email. Please verify.")
  )
})

// ── Verify OTP ────────────────────────────────────────
const verifyOTP = asynchandler(async (req, res) => {
  const { email, otp } = req.body

  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required")
  }

  const user = await User.findOne({ email })
  if (!user) {
    throw new ApiError(404, "User not found")
  }

  // Check if already verified
  if (user.isVerified) {
    throw new ApiError(400, "Account already verified")
  }

  // Check OTP expiry
  if (Date.now() > user.otpExpiry) {
    throw new ApiError(400, "OTP has expired. Please register again.")
  }

  // Check OTP match
  if (user.otp !== otp) {
    throw new ApiError(400, "Invalid OTP. Please try again.")
  }

  // Activate account
  user.isVerified = true
  user.otp = null
  user.otpExpiry = null
  await user.save()

  // Generate tokens — auto login after verification
  const { accessToken, refreshToken } = generateTokens(res, user._id)

  user.refreshToken = refreshToken
  await user.save()

  const verifiedUser = await User.findById(user._id).select(
    "-password -refreshToken -otp -otpExpiry"
  )

  // Send welcome email
  try {
    await sendEmail({
      to: email,
      subject: "Welcome to BillSplit! 🎉",
      html: welcomeTemplate({ username: user.username })
    })
  } catch (emailError) {
    console.error("Welcome email failed:", emailError.message)
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 1000
    })
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    .json(new ApiResponse(200, verifiedUser, "Account verified successfully"))
})

// ── Resend OTP ────────────────────────────────────────
const resendOTP = asynchandler(async (req, res) => {
  const { email } = req.body

  if (!email) {
    throw new ApiError(400, "Email is required")
  }

  const user = await User.findOne({ email })
  if (!user) {
    throw new ApiError(404, "User not found")
  }

  if (user.isVerified) {
    throw new ApiError(400, "Account already verified")
  }

  // Generate new OTP
  const otp = generateOTP()
  user.otp = otp
  user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000)
  await user.save()

  try {
    await sendEmail({
      to: email,
      subject: "Your new BillSplit verification code",
      html: otpTemplate({ username: user.username, otp })
    })
  } catch (emailError) {
    throw new ApiError(500, "Failed to send OTP. Please try again.")
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "New OTP sent successfully")
  )
})

// ── Login ────────────────────────────────────────────
const loginUser = asynchandler(async (req, res) => {
  const { email, password } = req.body

  // Validation
  if (!email || !password) {
    throw new ApiError(400, "Email and password are required")
  }

  // Find user
  const user = await User.findOne({ email })
  if (!user) {
    throw new ApiError(404, "User not found")
  }

  // Login only needs this check
  if (!user.isVerified) {
  throw new ApiError(403, "Please verify your email before logging in")
  }

  // Check password
  const isMatch = await user.matchPassword(password)
  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials")
  }

  // Handle scheduled deletion & temporary deactivation status
  let statusMessage = "Logged in successfully"
  let updateStatus = {}

  if (user.isScheduledForDeletion) {
    const now = new Date()
    if (user.scheduledDeletionDate && now >= new Date(user.scheduledDeletionDate)) {
      // 30 days limit reached! Delete user info permanently from DB
      await User.findByIdAndDelete(user._id)
      throw new ApiError(410, "Your 30-day deletion period has passed. Your account info has been permanently deleted from the database.")
    } else {
      // Logging in within 30 days reactivates the account and cancels deletion
      updateStatus = {
        isScheduledForDeletion: false,
        isDeactivated: false,
        deletionRequestedAt: null,
        scheduledDeletionDate: null
      }
      statusMessage = "Welcome back! Account reactivated and deletion request canceled."
    }
  } else if (user.isDeactivated) {
    // Logging in reactivates temporarily deactivated account
    updateStatus = { isDeactivated: false }
    statusMessage = "Welcome back! Your temporarily deactivated account is now active."
  }

  // Generate tokens (sets HTTP cookies automatically)
  const { accessToken, refreshToken } = generateTokens(res, user._id)

  // Save refresh token & status in DB
  await User.findByIdAndUpdate(user._id, {
    ...updateStatus,
    refreshToken: refreshToken
  })

  // Send response
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

 return res
    .status(200)
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 1000
    })
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    .json(new ApiResponse(200, loggedInUser, statusMessage))
})

// ── Logout ───────────────────────────────────────────
const logoutUser = asynchandler(async (req, res) => {
  // Remove refresh token from DB
  await User.findByIdAndUpdate(req.user._id, {
    refreshToken: null
  })

  // Clear cookies
  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Logged out successfully"))
})

// ── Refresh Access Token ─────────────────────────────
const refreshAccessToken = asynchandler(async (req, res) => {
  const token = req.cookies?.refreshToken

  if (!token) {
    throw new ApiError(401, "No refresh token")
  }

  // Verify refresh token
  const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)

  // Find user and check token matches DB
  const user = await User.findById(decoded.userId)
  if (!user || user.refreshToken !== token) {
    throw new ApiError(401, "Invalid refresh token")
  }

  const newAccessToken = jwt.sign(
    { userId: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "1h" }
  )

  const newRefreshToken = jwt.sign(
    { userId: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d" }
  )

  user.refreshToken = newRefreshToken
  await user.save()

  setAuthCookies(res, newAccessToken, newRefreshToken)

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Access token refreshed successfully"))
})

// ── Forgot Password ───────────────────────────────────
const forgotPassword = asynchandler(async (req, res) => {
  const { email } = req.body

  if (!email) {
    throw new ApiError(400, "Email is required")
  }

  const user = await User.findOne({ email })
  if (!user) {
    throw new ApiError(404, "No user found with this email")
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString("hex")

  // Hash before saving to DB
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex")

  // Save to user
  user.resetPasswordToken = hashedToken
  user.resetPasswordExpiry = Date.now() + 10 * 60 * 1000 // 10 minutes
  await user.save()

  // Reset URL
  const frontendBaseUrl = process.env.CLIENT_URL || "http://localhost:5173"
  const resetUrl = `${frontendBaseUrl}/reset-password/${resetToken}`

  // Send email
  try {
    await sendEmail({
      to: email,
      subject: "BillSplit Password Reset Request",
      html: resetPasswordTemplate({
        username: user.username,
        resetUrl
      })
    })
  } catch (emailError) {
    // Clear token if email fails
    user.resetPasswordToken = null
    user.resetPasswordExpiry = null
    await user.save()
    throw new ApiError(500, "Failed to send reset email. Please try again.")
  }

  return res.status(200).json(
    new ApiResponse(200, {}, "Password reset link sent to your email")
  )
})

// ── Reset Password ────────────────────────────────────
const resetPassword = asynchandler(async (req, res) => {
  const { token } = req.params
  const { password } = req.body

  if (!token || token === "undefined") {
    throw new ApiError(400, "Invalid or missing reset token")
  }

  if (!password) {
    throw new ApiError(400, "Password is required")
  }

  // Match your user model validation
  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters long")
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
  if (!passwordRegex.test(password)) {
    throw new ApiError(400, "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
  }

  // Hash token from URL
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex")

  // Find user with valid token
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiry: { $gt: Date.now() }
  })

  if (!user) {
    throw new ApiError(400, "Invalid or expired reset token")
  }

  // Update password
  user.password = password
  user.resetPasswordToken = null
  user.resetPasswordExpiry = null
  await user.save()

  return res.status(200).json(
    new ApiResponse(200, {}, "Password reset successfully. Please login.")
  )
})

// ── Get Current User ─────────────────────────────────
const getCurrentUser = asynchandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"))
})

// ── Update Profile ────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const { username, email } = req.body

    const updateData = {}
    if (typeof username !== "undefined") updateData.username = username
    if (typeof email !== "undefined") updateData.email = email

    let avatarUrl = req.user.avatar
    if (req.file && req.file.buffer) {
      avatarUrl = await uploadToCloudinary(req.file.buffer, "avatars")
    }
    updateData.avatar = avatarUrl

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select("-password -refreshToken")

    if (!updatedUser) {
      throw new ApiError(404, "User not found")
    }

    return res.status(200).json(
      new ApiResponse(200, updatedUser, "Profile updated successfully")
    )
  } catch (error) {
    next(error)
  }
} 

// ── Changing Password ────────────────────────────────────
const changePassword = asynchandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "Both fields are required")
  }

  if (newPassword.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters long")
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
  if (!passwordRegex.test(newPassword)) {
    throw new ApiError(400, "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character")
  }

  const user = await User.findById(req.user._id)
  const isMatch = await user.matchPassword(currentPassword)
  if (!isMatch) {
    throw new ApiError(401, "Current password is incorrect")
  }

  user.password = newPassword
  await user.save()

  return res.status(200).json(
    new ApiResponse(200, {}, "Password changed successfully")
  )
})

// ── Deactivate Account Temporarily ────────────────────
const deactivateAccount = asynchandler(async (req, res) => {
  const user = await User.findById(req.user._id)
  if (!user) {
    throw new ApiError(404, "User not found")
  }

  await User.findByIdAndUpdate(req.user._id, {
    isDeactivated: true,
    refreshToken: null
  })

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Your account has been temporarily deactivated."))
})

// ── Request Delete Account (30-day grace period) ──────
const requestDeleteAccount = asynchandler(async (req, res) => {
  const { confirmationText } = req.body

  if (!confirmationText || confirmationText.trim().toLowerCase() !== "delete") {
    throw new ApiError(400, "Please type 'delete' to confirm account deletion.")
  }

  const user = await User.findById(req.user._id)
  if (!user) {
    throw new ApiError(404, "User not found")
  }

  const now = new Date()
  const scheduledDeletionDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  await User.findByIdAndUpdate(req.user._id, {
    isDeactivated: true,
    isScheduledForDeletion: true,
    deletionRequestedAt: now,
    scheduledDeletionDate: scheduledDeletionDate,
    refreshToken: null
  })

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(
      new ApiResponse(
        200,
        { scheduledDeletionDate },
        "Your account is temporary deactivated and deleted after 30 days."
      )
    )
})

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  updateProfile,
  changePassword,
  deactivateAccount,
  requestDeleteAccount,
  verifyOTP,
  resendOTP,
  resetPassword,
  forgotPassword
}