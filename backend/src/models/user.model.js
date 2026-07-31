import mongoose, { Schema } from "mongoose"
import bcrypt from "bcryptjs"

const userSchema = new Schema({
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: true,
        trim: true,
        lowercase: true,
        index: true
    },
    email: {
        type: String,
        required: [true, "Email is required."],
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, "Password is required."],


    },
    avatar: {
        type: String,
        default: ''
    },
    groups:
        [
            {
                type: Schema.Types.ObjectId,
                ref: "Group"
            }
        ],
    isDeactivated: {
        type: Boolean,
        default: false
    },
    isScheduledForDeletion: {
        type: Boolean,
        default: false
    },
    deletionRequestedAt: {
        type: Date,
        default: null
    },
    scheduledDeletionDate: {
        type: Date,
        default: null
    },
    refreshToken: {
        type: String,
        default: null
    }
}, { timestamps: true })

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return
    this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}


const User = mongoose.model("User", userSchema);
export default User;
