import User from "../models/user.model.js"
import PendingUser from "../models/pendingUser.model.js"
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
import { OAuth2Client } from "google-auth-library"

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)




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

  // Username length validation
  if (username.trim().length < 5 || username.trim().length > 30) {
    throw new ApiError(400, "Username must be between 5 and 30 characters")
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Invalid email format")
  }

  // Check if user is already registered in main User collection
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw new ApiError(409, "Email is already registered")
  }

  // Check if username is taken in main User collection
  const existingUsername = await User.findOne({ username })
  if (existingUsername) {
    throw new ApiError(409, "Username is already taken")
  }

  // Upload avatar if provided
  let avatarUrl = ""
  if (req.file && req.file.buffer) {
    avatarUrl = await uploadToCloudinary(req.file.buffer, "avatars")
  }

  // Generate OTP
  const otp = generateOTP()
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000)

  // Dev log for easy local testing
  console.log(`\n========================================`)
  console.log(`🔑 [OTP GENERATED] Email: ${email} | OTP: ${otp}`)
  console.log(`========================================\n`)

  // Save pending registration in PendingUser (NOT in main User collection)
  await PendingUser.findOneAndUpdate(
    { email },
    {
      username,
      email,
      password,
      avatar: avatarUrl,
      otp,
      otpExpiry,
      createdAt: new Date()
    },
    { upsert: true, new: true }
  )

  // Send OTP email
  try {
    await sendEmail({
      to: email,
      subject: "Verify your BillSplit account",
      html: otpTemplate({ username, otp })
    })
  } catch (emailError) {
    // Delete pending record if email sending fails completely
    await PendingUser.deleteOne({ email })
    throw new ApiError(500, `Failed to send verification email: ${emailError.message}`)
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

  // Check if already registered in main User collection
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw new ApiError(400, "Account is already registered and verified")
  }

  // Find in PendingUser collection
  const pendingUser = await PendingUser.findOne({ email })
  if (!pendingUser) {
    throw new ApiError(404, "Invalid request or OTP has expired. Please register again.")
  }

  // Check OTP expiry
  if (!pendingUser.otpExpiry || Date.now() > new Date(pendingUser.otpExpiry).getTime()) {
    await PendingUser.deleteOne({ email })
    throw new ApiError(400, "OTP has expired. Please register again.")
  }

  // Check OTP match
  if (pendingUser.otp !== otp) {
    throw new ApiError(400, "Invalid OTP. Please try again.")
  }

  // Create permanent user in main User collection ONLY AFTER successful OTP verification
  const user = await User.create({
    username: pendingUser.username,
    email: pendingUser.email,
    password: pendingUser.password, // Mongoose pre('save') hook will hash this password
    avatar: pendingUser.avatar,
    isVerified: true
  })

  // Clean up temporary pending user document
  await PendingUser.deleteOne({ email })

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

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw new ApiError(400, "Account already registered and verified")
  }

  const pendingUser = await PendingUser.findOne({ email })
  if (!pendingUser) {
    throw new ApiError(404, "No pending registration found for this email. Please register again.")
  }

  // Generate new OTP
  const otp = generateOTP()
  pendingUser.otp = otp
  pendingUser.otpExpiry = new Date(Date.now() + 10 * 60 * 1000)
  pendingUser.createdAt = new Date()
  await pendingUser.save()

  console.log(`\n========================================`)
  console.log(`🔑 [RESEND OTP GENERATED] Email: ${email} | OTP: ${otp}`)
  console.log(`========================================\n`)

  try {
    await sendEmail({
      to: email,
      subject: "Your new BillSplit verification code",
      html: otpTemplate({ username: pendingUser.username, otp })
    })
  } catch (emailError) {
    throw new ApiError(500, `Failed to send OTP: ${emailError.message}`)
  }

  return res.status(200).json(
    new ApiResponse(200, { email }, "New OTP sent successfully")
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

// ── Generate Unique Google Username ───────────────────
const generateGoogleUsername = async (name, email) => {
  let source = (name || (email ? email.split("@")[0] : "User")).trim()
  let cleaned = source.replace(/[^a-zA-Z0-9]/g, "")
  if (!cleaned) cleaned = "User"
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
  let base = cleaned.slice(0, 15)
  if (base.length < 5) {
    base = `${base}User`.slice(0, 15)
  }

  let candidate = base
  let existing = await User.findOne({ username: candidate })
  if (!existing) return candidate

  for (let i = 0; i < 15; i++) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString()
    candidate = `${base.slice(0, 20)}${randomSuffix}`.slice(0, 30)
    existing = await User.findOne({ username: candidate })
    if (!existing) return candidate
  }

  return `User${Date.now().toString().slice(-7)}`
}

// ── Google Auth (Sign in / Sign up) ────────────────────
const googleAuth = asynchandler(async (req, res) => {
  const { credential, token, accessToken, mode = "login" } = req.body
  const receivedToken = token || accessToken

  if (!credential && !receivedToken) {
    throw new ApiError(400, "Google credential or token is required")
  }

  let googleUser = null

  // 1. Verify via ID Token (credential) if provided
  if (credential) {
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID
      })
      googleUser = ticket.getPayload()
    } catch (err) {
      console.error("verifyIdToken error:", err.message)
      throw new ApiError(401, "Invalid Google ID token")
    }
  } 
  // 2. Verify via Access Token (from useGoogleLogin) if provided
  else if (receivedToken) {
    try {
      const googleRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${receivedToken}` }
      })
      if (!googleRes.ok) {
        throw new Error(`Google responded with status ${googleRes.status}`)
      }
      googleUser = await googleRes.json()
    } catch (err) {
      console.error("Google userinfo fetch error:", err.message)
      throw new ApiError(401, "Failed to authenticate with Google access token")
    }
  }

  if (!googleUser || !googleUser.email) {
    throw new ApiError(400, "Unable to retrieve Google user profile")
  }

  // Ensure Google email is verified by Google
  if (googleUser.email_verified === false) {
    throw new ApiError(403, "Your Google email address is not verified by Google.")
  }

  const email = googleUser.email.toLowerCase()
  const googleId = googleUser.sub
  const name = googleUser.name
  const picture = googleUser.picture

  // Check if user already exists in database
  let user = await User.findOne({ email })

  // Real-world flow: On Login page, user MUST already exist in DB
  if (mode === "login" && !user) {
    throw new ApiError(404, "No account found with this Google email. Please create an account first.")
  }

  // Real-world flow: On Register page, prevent duplicate account creation
  if (mode === "register" && user) {
    throw new ApiError(409, "An account with this email already exists. Please sign in instead.")
  }

  if (user) {
    // Existing user: Link Google ID and sync avatar / verification if needed
    if (!user.googleId) {
      user.googleId = googleId
    }
    if (!user.avatar && picture) {
      user.avatar = picture
    }
    user.isVerified = true

    // Handle scheduled deletion or deactivation reactivation
    let statusMessage = "Logged in successfully with Google"
    if (user.isScheduledForDeletion) {
      const now = new Date()
      if (user.scheduledDeletionDate && now >= new Date(user.scheduledDeletionDate)) {
        await User.findByIdAndDelete(user._id)
        throw new ApiError(410, "Your 30-day deletion period has passed. Your account info has been permanently deleted.")
      } else {
        user.isScheduledForDeletion = false
        user.isDeactivated = false
        user.deletionRequestedAt = null
        user.scheduledDeletionDate = null
        statusMessage = "Welcome back! Account reactivated and deletion request canceled."
      }
    } else if (user.isDeactivated) {
      user.isDeactivated = false
      statusMessage = "Welcome back! Your temporarily deactivated account is now active."
    }

    // Generate tokens & cookies
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(res, user._id)
    user.refreshToken = newRefreshToken
    await user.save()

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    return res
      .status(200)
      .cookie("accessToken", newAccessToken, {
        ...cookieOptions,
        maxAge: 60 * 60 * 1000
      })
      .cookie("refreshToken", newRefreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000
      })
      .json(new ApiResponse(200, loggedInUser, statusMessage))

  } else {
    // New user: Register with Google
    const username = await generateGoogleUsername(name, email)

    user = await User.create({
      username,
      email,
      googleId,
      authProvider: "google",
      avatar: picture || "",
      isVerified: true
    })

    // Clean up any pending unverified OTP record
    await PendingUser.deleteOne({ email })

    // Generate tokens & cookies
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = generateTokens(res, user._id)
    user.refreshToken = newRefreshToken
    await user.save()

    // Send welcome email (non-blocking)
    try {
      await sendEmail({
        to: email,
        subject: "Welcome to BillSplit! 🎉",
        html: welcomeTemplate({ username: user.username })
      })
    } catch (emailError) {
      console.error("Welcome email failed:", emailError.message)
    }

    const newUser = await User.findById(user._id).select("-password -refreshToken")

    return res
      .status(201)
      .cookie("accessToken", newAccessToken, {
        ...cookieOptions,
        maxAge: 60 * 60 * 1000
      })
      .cookie("refreshToken", newRefreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000
      })
      .json(new ApiResponse(201, newUser, "Account created and logged in with Google successfully"))
  }
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
  forgotPassword,
  googleAuth
}