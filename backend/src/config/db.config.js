import mongoose from "mongoose"

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI 

  if (!mongoUri) {
    console.error("MongoDB connection string is missing. Set MONGO_URI in your .env file.")
    process.exit(1)
  }

  try {
    await mongoose.connect(mongoUri)
    console.log("DB: connected")
  } catch (error) {
    console.error("DB: connection failed")
    process.exit(1)
  }
}

export default connectDB