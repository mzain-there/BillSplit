import jwt from "jsonwebtoken"
import User from "../models/user.model.js"
import ApiError from "../utils/ApiError.js"

const verifyJWT = async (req, res, next) => {
  try {
    
    const token = req.cookies?.accessToken

    if (!token) {
      throw new ApiError(401, "Unauthorized — no token provided")
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

    const user = await User.findById(decoded.userId).select(
      "-password -refreshToken"
    )

    if (!user) {
      throw new ApiError(401, "Invalid token — user not found")
    }

    req.user = user
    next()

  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new ApiError(401, "Access token expired"))
    }
    return next(new ApiError(401, error.message || "Unauthorized"))
  }
}

export default verifyJWT