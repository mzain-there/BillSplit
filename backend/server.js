import dotenv from "dotenv"
dotenv.config()

import app from "./app.js"
import connectDB from "./src/config/db.config.js"
import connectCloudinary from "./src/config/cloudinary.config.js"


const PORT = process.env.PORT || 5000

// Connect DB and Cloudinary then start server
connectDB()
connectCloudinary()


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})