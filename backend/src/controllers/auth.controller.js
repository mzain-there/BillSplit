import User from "../models/user.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import { asynchandler } from "../utils/asynchandler.js"
import { generateTokens, setAuthCookies, ACCESS_TOKEN_MAX_AGE, REFRESH_TOKEN_MAX_AGE } from "../utils/generateToken.js"
import jwt from "jsonwebtoken"
import uploadToCloudinary from "../utils/uploadToCloudinary.js"

// Cookie options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
}

// ── Register ────────────────────────────────────────
const registerUser = asynchandler(async (req, res) => {
  const { username, email, password } = req.body

  // Validation
  if (!username || !email || !password) {
    console.error("Registration validation failed. Received body:", req.body)
    const missingFields = []
    if (!username) missingFields.push("username")
    if (!email) missingFields.push("email")
    if (!password) missingFields.push("password")
    throw new ApiError(400, `All fields are required. Missing: ${missingFields.join(", ")}`)
  }

  // Check if user exists
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw new ApiError(409, "Email already registered")
  }

  let avatarUrl = ""
  if (req.file) {
    avatarUrl = await uploadToCloudinary(req.file.buffer, "avatars")
  }

  // Create user
  const user = await User.create({ username, email, password, avatar: avatarUrl })

  // Fetch created user without sensitive fields
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )
  if (!createdUser) {
    throw new ApiError(500, "User not created")
  }

  return res.status(201).json(
    new ApiResponse(201, createdUser, "User registered successfully")
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
    throw new ApiError(400, "Current password and new password are required")
  }

  const user = await User.findById(req.user._id)
  if (!user) {
    throw new ApiError(404, "User not found")
  }

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
  requestDeleteAccount
}