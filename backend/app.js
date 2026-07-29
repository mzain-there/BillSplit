import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import authRoutes from "./src/routes/auth.routes.js"
import errorHandler from "./src/middlewares/error.middleware.js"
import groupRoutes from "./src/routes/group.routes.js"
import expenseRoutes from "./src/routes/expense.routes.js"
import settlementRoutes from "./src/routes/settlement.routes.js"

const app = express()

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.CLIENT_URL,
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "http://127.0.0.1:5175",
    ].filter(Boolean)

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`), false)
    }
  },
  credentials: true // allows cookies to be sent
}))
app.use(express.json({ limit: "10mb" })) // parses incoming JSON requests
app.use(express.urlencoded({ extended: true, limit: "10mb" })) // parses form data
app.use(cookieParser()) // parses cookies from request


app.use("/api/auth", authRoutes)
app.use("/api/groups", groupRoutes)
app.use("/api/expenses", expenseRoutes)
app.use("/api/settlements", settlementRoutes)

app.get("/", (req, res) => {
  res.send("BillSplit API is running...")
})

app.use(errorHandler)

export default app