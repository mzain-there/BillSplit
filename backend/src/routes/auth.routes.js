import express from "express"
import {
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
  forgotPassword,
  resetPassword
} from "../controllers/auth.controller.js"
import verifyJWT from "../middlewares/auth.middleware.js"
import upload from "../middlewares/multer.middleware.js"

const router = express.Router()

// Public routes — no token needed
router.post("/register",upload.single("avatar"), registerUser)
router.post("/login", loginUser)
router.post("/refresh-token", refreshAccessToken)
router.post("/forgot-password", forgotPassword)
router.post("/reset-password/:token", resetPassword)

// Protected routes — token required
router.post("/logout", verifyJWT, logoutUser)
router.get("/me", verifyJWT, getCurrentUser)

// Update Profile
router.put("/update-profile", verifyJWT, upload.single("avatar"), updateProfile)
router.put("/change-password", verifyJWT, changePassword)

// Deactivate & Delete Account
router.post("/deactivate-account", verifyJWT, deactivateAccount)
router.post("/delete-account", verifyJWT, requestDeleteAccount)

// Public routes
router.post("/verify-otp", verifyOTP)
router.post("/resend-otp", resendOTP)

export default router