import dotenv from "dotenv"
dotenv.config()

import app from "./app.js"
import connectDB from "./src/config/db.config.js"


const PORT = process.env.PORT || 5000

// Connect DB and Cloudinary then start server
connectDB()


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})