import express from "express"
import {
  addExpense,
  getGroupExpenses,
  editExpense,
  deleteExpense,
  getGroupBalances
} from "../controllers/expense.controller.js"
import verifyJWT from "../middlewares/auth.middleware.js"

const router = express.Router()

router.use(verifyJWT)

router.post("/:groupId", addExpense)
router.get("/:groupId", getGroupExpenses)
router.get("/:groupId/balances", getGroupBalances)
router.put("/:expenseId", editExpense)
router.delete("/:expenseId", deleteExpense)

export default router