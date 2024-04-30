const mongoose=require('mongoose')
const orderSchema= new mongoose.Schema({
    UserId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    products:[{
        productId:{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:"Product"
        },
        quantity:{
            type:String,
            required:true,
            default:1
        },
        status:{
            type:String,
            statu:['Placed','shipped','delivered','returned','cancelled'],
            default:'Placed'
            // enum:['pending','shipped','delivered','cancelled']
        },
        returnReason:{
            type:String,
            default:'None'
        }
    }],
    orderAmount:{
        type:Number,
        required:true
    },
    deliverAddress:{
        name:{type:String,required:true},
        mobile:{type:Number,required:true},
        pincode:{type:Number,required:true},
        email:{type:String,required:true},
        locality:{type:String,required:true},
        addressData:{type:String,required:true},
        city:{type:String,required:true},
        state:{type:String,required:true},
        },
    paymentMethod:{
        type:String,
        enum:['Online Payment', 'Cash on Delivery'],
        required:true
    },
    orderDate:{
        type:String,
        required:true,
    },
    paymentStatus:{
        type:String,
        enum:['Paid', 'Pending', 'Failed'],
        required:true,
    }


   
})

module.exports=mongoose.model('Order',orderSchema)