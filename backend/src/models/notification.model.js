import mongoose, { Schema } from "mongoose"

const notificationSchema = new Schema({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    enum: ["expense_added", "settlement_made", "member_added", "payment_reminder"],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  metadata: {
    groupId: {
      type: Schema.Types.ObjectId,
      ref: "Group"
    },
    expenseId: {
      type: Schema.Types.ObjectId,
      ref: "Expense"
    },
    settlementId: {
      type: Schema.Types.ObjectId,
      ref: "Settlement"
    },
    amount: Number
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

const Notification = mongoose.model("Notification", notificationSchema)
export default Notification
