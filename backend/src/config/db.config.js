import mongoose from "mongoose"

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI 

  if (!mongoUri) {
    console.error("MongoDB connection string is missing. Set MONGO_URI in your .env file.")
    process.exit(1)
  }

  try {
    const connection = await mongoose.connect(mongoUri)
    console.log(`MongoDB Connected: ${connection.connection.host}`)
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`)
    process.exit(1)
  }
}

export default connectDB