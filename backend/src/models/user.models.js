import mongoose, {Schema} from "mongoose"
import bcrypt from "bcryptjs"

const userSchema=new Schema({
    username:{
        type:String,
        required:[true, "Username is required"],
        unique: true,
        trim: true,
        lowercase: true,
        index: true
    },
    email:{
        type:String,
        required:[true, "Email is required."],
        unique:true,
        lowercase:true
    }, 
    password:{
        type:String,
        required:[true, "Password is required."],
        

    }, 
    avatar:{
        type:String,
        default:''
    }, 
    groups:
    [
    {
        type:Schema.Types.ObjectId,
        ref:"Group"
    }
    ]
}, {timestamps:true})

//Hash password before saving.
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}


export const User=mongoose.model("User", userSchema);