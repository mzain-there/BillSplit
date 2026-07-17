import mongoose,{model, Schema} from "mongoose";

const groupSchema=new Schema({
    name:{
      type: String,
      required: [true, "Group name is required"],
      trim: true,
    }, 
    description:{
        type:String,
        required:true
    }, 
    createdby:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    avatar:{
        type:String,

    },
    members:[
        {
            name:{
                type:Schema.Types.ObjectId,
                ref:'User'
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

export const Group=mongoose.model("Group", groupSchema)