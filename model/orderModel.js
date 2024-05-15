const mongoose=require('mongoose')
const orderSchema= new mongoose.Schema({
    UserId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    },
    orderId: {
        type: String,
        unique: true,
        required: true,
      },
    products:[{
        productId:{
            type:mongoose.Schema.Types.ObjectId,
            required:true,
            ref:"Product"
        },
        productPrice:{
            type:Number,
            required:true
        },
        quantity:{
            type:String,
            required:true,
            default:1
        },
        status:{
            type:String,
            statu:['Placed','pending','shipped','delivered','returned','cancelled'],
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
        enum:['UPI', 'Cash on Delivery','wallet'],
        required:true
    },
    orderDate:{
        type:Date,
        default:Date.now,
    },
    paymentStatus:{
        type:String,
        enum:['Paid', 'Pending', 'Failed'],
        required:true,
    },
    CoupenOffer:{
        type:Number,
        default:0
    },
    OfferDiscount:{
        type:Number,
        default:0
    }   
})

module.exports=mongoose.model('Order',orderSchema)