import Expense from "../models/expense.model.js"
import Group from "../models/group.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import { calculateSplitAmounts, calculateBalances, simplifyDebts } from "../utils/calculateSplit.js"


//Add Expense

const addExpense = async (req, res, next) => {
  try {
    const { title, amount, splitType, splits, date, notes, paidBy: paidByField } = req.body
    const groupId = req.params.groupId

    // Validation
    if (!title || !amount) {
      throw new ApiError(400, "Title and amount are required")
    }

    // Check group exists
    const group = await Group.findById(groupId)
    if (!group) {
      throw new ApiError(404, "Group not found")
    }

    // Check user is member of group
    const isMember = group.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    )
    if (!isMember) {
      throw new ApiError(403, "You are not a member of this group")
    }

    // Validate paidBy — must be a group member; default to current user
    let paidById = req.user._id
    if (paidByField) {
      const isPaidByMember = group.members.some(
        (m) => m.user.toString() === paidByField.toString()
      )
      if (!isPaidByMember) {
        throw new ApiError(400, "The selected payer is not a member of this group")
      }
      paidById = paidByField
    }

    // Get all member IDs EXCEPT the payer (payer doesn't owe themselves)
    const memberIds = group.members
      .map((m) => m.user)
      .filter((uid) => uid.toString() !== paidById.toString())

    // Calculate splits based on type
    const calculatedSplits = calculateSplitAmounts(
      parseFloat(amount),
      memberIds,
      splitType || "equal",
      splits || []
    )

    // Create expense
    const expense = await Expense.create({
      title,
      amount: parseFloat(amount),
      paidBy: paidById,
      group: groupId,
      splitType: splitType || "equal",
      splits: calculatedSplits,
      date: date || Date.now(),
      notes: notes || "",
    })

    // Add expense to group
    await Group.findByIdAndUpdate(groupId, {
      $push: { expenses: expense._id },
    })

    const populatedExpense = await Expense.findById(expense._id)
      .populate("paidBy", "username email avatar")
      .populate("splits.user", "username email avatar")

    return res.status(201).json(
      new ApiResponse(201, populatedExpense, "Expense added successfully")
    )
  } catch (error) {
    next(error)
  }
}


//Get All Expenses in Group

const getGroupExpenses = async (req, res, next) => {
  try {
    const { groupId } = req.params

    // Check group exists
    const group = await Group.findById(groupId)
    if (!group) {
      throw new ApiError(404, "Group not found")
    }

    // Check user is member
    const isMember = group.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    )
    if (!isMember) {
      throw new ApiError(403, "You are not a member of this group")
    }

    const expenses = await Expense.find({ group: groupId })
      .populate("paidBy", "username email avatar")
      .populate("splits.user", "username email avatar")
      .sort({ date: -1 })

    return res.status(200).json(
      new ApiResponse(200, expenses, "Expenses fetched successfully")
    )
  } catch (error) {
    next(error)
  }
}

//Edit Expense

const editExpense = async (req, res, next) => {
  try {
    const { expenseId } = req.params
    const { title, amount, splitType, splits, date, notes } = req.body

    const expense = await Expense.findById(expenseId)
    if (!expense) {
      throw new ApiError(404, "Expense not found")
    }

    // Only person who paid can edit
    if (expense.paidBy.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "Only the person who paid can edit this expense")
    }

    // Recalculate splits if amount or splitType changed
    let updatedSplits = expense.splits
    if (amount || splitType) {
      const group = await Group.findById(expense.group)
      // Exclude the payer from splits
      const memberIds = group.members
        .map((m) => m.user)
        .filter((uid) => uid.toString() !== expense.paidBy.toString())

      updatedSplits = calculateSplitAmounts(
        parseFloat(amount || expense.amount),
        memberIds,
        splitType || expense.splitType,
        splits || []
      )
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      expenseId,
      {
        title: title || expense.title,
        amount: amount ? parseFloat(amount) : expense.amount,
        splitType: splitType || expense.splitType,
        splits: updatedSplits,
        date: date || expense.date,
        notes: notes || expense.notes,
      },
      { new: true }
    )
      .populate("paidBy", "username email avatar")
      .populate("splits.user", "username email avatar")

    return res.status(200).json(
      new ApiResponse(200, updatedExpense, "Expense updated successfully")
    )
  } catch (error) {
    next(error)
  }
}

//Delete Expense 

const deleteExpense = async (req, res, next) => {
  try {
    const { expenseId } = req.params

    const expense = await Expense.findById(expenseId)
    if (!expense) {
      throw new ApiError(404, "Expense not found")
    }

    // Only person who paid can delete
    if (expense.paidBy.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "Only the person who paid can delete this expense")
    }

    // Remove expense from group
    await Group.findByIdAndUpdate(expense.group, {
      $pull: { expenses: expense._id },
    })

    await Expense.findByIdAndDelete(expenseId)

    return res.status(200).json(
      new ApiResponse(200, {}, "Expense deleted successfully")
    )
  } catch (error) {
    next(error)
  }
}


//Get Balances

const getGroupBalances = async (req, res, next) => {
  try {
    const { groupId } = req.params

    const group = await Group.findById(groupId)
    if (!group) {
      throw new ApiError(404, "Group not found")
    }

    // Check user is member
    const isMember = group.members.some(
      (m) => m.user.toString() === req.user._id.toString()
    )
    if (!isMember) {
      throw new ApiError(403, "You are not a member of this group")
    }

    // Get all expenses
    const expenses = await Expense.find({ group: groupId })
      .populate("paidBy", "username email avatar")
      .populate("splits.user", "username email avatar")

    // Calculate balances
    const balances = calculateBalances(expenses, req.user._id)

    // Simplify debts
    const simplified = simplifyDebts(balances)

    return res.status(200).json(
      new ApiResponse(200, { balances, simplified }, "Balances fetched successfully")
    )
  } catch (error) {
    next(error)
  }
}

export {
  addExpense,
  getGroupExpenses,
  editExpense,
  deleteExpense,
  getGroupBalances
}