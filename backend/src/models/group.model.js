import mongoose, { model, Schema } from "mongoose";

const groupSchema = new Schema({
    name: {
        type: String,
        required: [true, "Group name is required"],
        trim: true,
    },
    description: {
        type: String,
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    avatar: {
        type: String,

    },
    members: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            },
            role: {
                type: String,
                enum: ["admin", "member"],
                default: "member",
            },
            joinedAt: {
                type: Date,
                default: Date.now,
            },


        }
    ],
    expenses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Expense",
        },
    ],
})

const Group = mongoose.model("Group", groupSchema)
export default Group;