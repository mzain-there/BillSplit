import express from "express"
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser
} from "../controllers/auth.controller.js"
import verifyJWT from "../middlewares/auth.middleware.js"
import upload from "../middlewares/multer.middleware.js"

const router = express.Router()

// Public routes — no token needed
router.post("/register",upload.single("avatar"), registerUser)
router.post("/login", loginUser)
router.post("/refresh-token", refreshAccessToken)

// Protected routes — token required
router.post("/logout", verifyJWT, logoutUser)
router.get("/me", verifyJWT, getCurrentUser)



export default router