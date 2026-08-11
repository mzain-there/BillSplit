import express from "express"
import {
    settleUp,
    getGroupSettlements,
    getRemainingBalances,
    sendReminder
} from "../controllers/settlement.controller.js"
import verifyJWT from "../middlewares/auth.middleware.js"

const router = express.Router()

router.use(verifyJWT)

router.post("/:groupId", settleUp)
router.get("/:groupId", getGroupSettlements)
router.get("/:groupId/remaining", getRemainingBalances)
router.post("/:groupId/remind", sendReminder)

export default router