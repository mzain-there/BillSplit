import mongoose, { Schema, model } from "mongoose";

const expenseSchema = new Schema({
  title: {
    type: String,
    required: [true, "Title is required."]
  },
  amount: {
    type: Number,
    required: [true, "Amount is required"]
  },
  group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  splitType: {
    type: String,
    enum: ["equal", "custom", "percentage"],
    default: "equal",
  },
  splits: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      amount: {
        type: Number,
        required: true,
      },
      isPaid: {
        type: Boolean,
        default: false,
      },
    }
  ],
  date: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    default: "",
  }
}, { timestamps: true })

const Expense = mongoose.model("Expense", expenseSchema);
export default Expense;