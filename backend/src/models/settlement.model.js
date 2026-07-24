import mongoose, {model, Schema} from "mongoose";

const settlementSchema=new Schema({

    group: {
      type:Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    paidBy: {
      type:Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    paidTo: {
      type:Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount cannot be negative"],
    },
    status: {
      type: String,
      enum: ["pending", "completed"],
      default: "completed",
    },
    settledAt: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      default: "",
    },

},{timestamps:true})

const Settlement=mongoose.model("Settlement", settlementSchema)
export default Settlement;