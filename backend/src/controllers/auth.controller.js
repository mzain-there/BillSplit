import User from "../models/user.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import { asynchandler } from "../utils/asynchandler.js"
import { generateTokens } from "../utils/generateToken.js"
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

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(res, user._id)

  // Save refresh token in DB
  user.refreshToken = refreshToken
  await user.save()

  // Send response
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000
    })
    .cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000
    })
    .json(new ApiResponse(200, loggedInUser, "Logged in successfully"))
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

  // Generate new access token only
  const { accessToken } = generateTokens(res, user._id)

  return res
    .status(200)
    .cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000
    })
    .json(new ApiResponse(200, {}, "Access token refreshed successfully"))
})

// ── Get Current User ─────────────────────────────────
const getCurrentUser = asynchandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"))
})

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser
}