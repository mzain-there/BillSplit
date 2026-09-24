import mongoose, { Schema } from "mongoose"

const pendingUserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    otp: {
      type: String,
      required: true,
    },
    otpExpiry: {
      type: Date,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600, // Automatically remove document from MongoDB after 10 minutes
    },
  },
  { timestamps: true }
)

const PendingUser = mongoose.model("PendingUser", pendingUserSchema)
export default PendingUser
