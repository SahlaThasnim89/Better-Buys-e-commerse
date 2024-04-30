const mongoose= require('mongoose')
const addressSchema= new mongoose.Schema({
    UserId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    address:[{
        name:{
            type:String,
            required:true
        },
        mobile:{
            type:Number,
            required:true
        },
        pincode:{
            type:Number,
            required:true
        },
        email:{
            type:String,
            required:true
        },
        locality:{
            type:String,
            required:true
        },
        addressData:{
            type:String,
            required:true
        },
        city:{
            type:String,
            required:true
        },
        state:{
            type:String,
            required:true
        },
        status:{
            type:Boolean,
            required:true,
            default:false
        }

    }]


})
module.exports=mongoose.model('Address',addressSchema)