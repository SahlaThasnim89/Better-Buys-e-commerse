const mongoose=require("mongoose")
const userSchema=new mongoose.Schema({

    FullName:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique: true
    },
    mobile:{
        type:String,
        required:true,
        unique: true
    },
    password:{
        type:String,
        required:true
    },
    is_admin:{
        type:Number,
        required:true,
        default:0
    },
    is_verified:{
        type:Number,
        required:true,
        default:0
    },
    is_blocked:{
        type:Boolean,
        required:true,
        default:false
    },
    googleId:{
        type:String
    },
    coupen: [{
        coupenId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Coupen'
        },
        isClaimed:{
            type:Boolean,
            default:false
        },
        validity:{
            type:Date,
            required:true
        },
        coupenCode:{
            type:String,
            required:true
        }
    }],
    refferalLink:{
        type:String,
    }
})
module.exports=mongoose.model("User",userSchema)



