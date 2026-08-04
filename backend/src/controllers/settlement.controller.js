import Settlement from "../models/settlement.model.js"
import Group from "../models/group.model.js"
import Expense from "../models/expense.model.js"
import User from "../models/user.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"
import { calculateBalances, simplifyDebts } from "../utils/calculateSplit.js"
import { createNotifications } from "../utils/createNotification.js"

//Settle Up 

const settleUp = async (req, res, next) => {
    try {
        const { groupId } = req.params
        const { paidTo, amount, note } = req.body

        // Validation
        if (!paidTo || !amount) {
            throw new ApiError(400, "paidTo and amount are required")
        }

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

        // Create settlement
        const settlement = await Settlement.create({
            group: groupId,
            paidBy: req.user._id,
            paidTo,
            amount: parseFloat(amount),
            note: note || "",
            status: "completed",
        })

        // NOTE: We do NOT mark expense splits as paid here.
        // Settlements are tracked separately, and getRemainingBalances
        // subtracts settlement amounts from expense-based balances.
        // This allows partial settlements to work correctly.

        const populatedSettlement = await Settlement.findById(settlement._id)
            .populate("paidBy", "username email avatar")
            .populate("paidTo", "username email avatar")
            .populate("group", "name")

        // Create notification for the person who received payment
        const payer = await User.findById(req.user._id)
        await createNotifications(
            [paidTo],
            req.user._id,
            "settlement_made",
            `${payer?.username || 'Someone'} paid you Rs. ${amount} in ${group.name}`,
            {
                groupId,
                settlementId: settlement._id,
                amount: parseFloat(amount)
            }
        )

        return res.status(201).json(
            new ApiResponse(201, populatedSettlement, "Payment settled successfully")
        )
    } catch (error) {
        next(error)
    }
}

//Get All Settlement

const getGroupSettlements = async (req, res, next) => {
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

        const settlements = await Settlement.find({ group: groupId })
            .populate("paidBy", "username email avatar")
            .populate("paidTo", "username email avatar")
            .sort({ settledAt: -1 })

        return res.status(200).json(
            new ApiResponse(200, settlements, "Settlements fetched successfully")
        )
    } catch (error) {
        next(error)
    }
}

//Get Remaining Balances After Settlements

const getRemainingBalances = async (req, res, next) => {
    try {
        const { groupId } = req.params

        const group = await Group.findById(groupId)
        if (!group) {
            throw new ApiError(404, "Group not found")
        }

        // Get all unsettled expenses
        const expenses = await Expense.find({ group: groupId })
            .populate("paidBy", "username email avatar")
            .populate("splits.user", "username email avatar")

        // Get all settlements
        const settlements = await Settlement.find({
            group: groupId,
            status: "completed",
        })

        // Calculate raw balances
        const balances = calculateBalances(expenses, req.user._id)

        // Subtract settled amounts from balances
        settlements.forEach((s) => {
            const from = s.paidBy.toString()
            const to = s.paidTo.toString()

            if (balances[from] && balances[from][to]) {
                balances[from][to] -= s.amount
                if (balances[from][to] <= 0) {
                    delete balances[from][to]
                }
            }
        })

        // Simplify remaining debts
        const simplified = simplifyDebts(balances)

        return res.status(200).json(
            new ApiResponse(
                200,
                { balances, simplified, settlements },
                "Remaining balances fetched successfully"
            )
        )
    } catch (error) {
        next(error)
    }
}

export { settleUp, getGroupSettlements, getRemainingBalances }