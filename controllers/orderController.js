const Order=require('../model/orderModel')
const Address=require('../model/addressModel')
const Cart=require('../model/cartModel')
const moment = require('moment');
const currentDate=moment();
require('dotenv').config()
const instance=require('../config/razorPay')
const User=require('../model/userModel')
const Product=require('../model/productModel')
const Coupen=require('../model/coupenModel')



const orderProduct=async(req,res)=>{
    try {
        const {user}=req.session
        const cart=await Cart.findOne({clientId:user}).populate('products.productId')
        const ADDRESS=await Address.findOne({UserId:user,'address.status':true},{'address.$':1})
        if(!ADDRESS){
            req.flash('msg','please add address')
            res.redirect('/checkOut')
        }
        const {name,mobile,pincode,email,locality, addressData,city,state} = ADDRESS?.address?.[0] ?? {};
        const products=cart.products


        let orderAmount=0
        let cartAmount=0
        let totalAmount=0
        let coupenApplied=0
        if(req.session.coupenCode){
            const coupen=await Coupen.findOne({coupenCode:req.session.coupenCode})
            cart.products.forEach(element => {
            totalAmount=element.productId.Price*element.quantity
            cartAmount=cartAmount+totalAmount
            coupenAmount=Math.ceil(cartAmount*coupen.offer/100)
            coupenApplied=cartAmount-coupenAmount
            orderAmount=coupenApplied
            })
        }else{
            cart.products.forEach(element => {
                totalAmount=element.productId.Price*element.quantity
                cartAmount=cartAmount+totalAmount
                orderAmount=cartAmount
            })
        }
     

        
        const order=new Order({
            UserId:user,
            products:products,
            deliverAddress:{
                name:name,
                mobile:mobile,
                email:email,
                pincode:pincode,
                addressData:addressData,
                locality:locality,
                state:state,
                city:city
            },
            orderDate:currentDate.format('DD-MM-YYYY'),
            orderAmount:orderAmount,
            paymentMethod:'Cash on Delivery',
            paymentStatus:'Pending'
            
        })
       const orderSave= await order.save()
       if(orderSave){
        for(const qty of products){
            let item=await Product.findOne({_id:qty.productId})
            let currentQty=item.Quantity-qty.quantity
            await Product.findOneAndUpdate({_id:qty.productId},{$set:{Quantity:currentQty}})
        }
        await Cart.findOneAndDelete({clientId:user})
        req.session.coupenCode=null

        // const coupenUsed=await Coupen.findOne({coupenCode:req.session.coupenCode})
        // const coupenUsed = await User.findOne({ 'coupen.coupenCode': req.session.coupenCode }).populate('coupen.coupenId');
        // if(coupenUsed){
        //     const claimed = await User.findOneAndUpdate(
        //         { "coupen.coupenId": coupenUsed._id }, 
        //         { $set: { "coupen.$.isClaimed": true } } 
        //     );   

        //  }
        res.redirect("/thanks")
       }
    } catch (error) {
        console.log(error.message)
    }
}



//admin Order List
const orderList=async(req,res)=>{
    try {
        const order=await Order.find().populate('products.productId').sort({orderDate:-1}).exec();
        res.render('admin/orderList',{order})
    } catch (error) {
        console.log(error.message);
    }
}

//admin side order Brief
const orderBrief=async(req,res)=>{
    try {
        const orderId=req.params.id
        const details=await Order.findOne({_id:orderId}).populate('products.productId UserId')
        // const returnReq=await Order.find({ 'products.returnReason': { $ne: 'None' }})
        res.render('admin/OrderBrief',{details})
    } catch (error) {
        console.log(error.message);
    }
}



//adminside

const updateOrderStatus=async(req,res)=>{
    try {
       const {orderId,newStatus}=req.body
       const update=await Order.findOneAndUpdate({'products._id':orderId},{$set:{'products.$.status':newStatus}},{new:true})
        res.json(update);
    } catch (error) {
        console.log(error.massage);
    }
}




//user side
const OrderDetails=async(req,res)=>{
    try {
        const item=req.params.id
        const orderItem=await Order.findOne({'products._id':item},{'products.$':1,deliverAddress:1}).populate('products.productId')
        res.render('user/orderDetails',{item:orderItem})
        
    } catch (error) {
        console.log(error.message);
    }
    
}


// user order cancel
const orderCancel=async(req,res)=>{
    try {
        const user=req.session.user
        const {cancel}=req.body
        const cancell = await Order.findOneAndUpdate({ UserId: user, 'products._id': cancel }, { $set: { 'products.$.status': 'cancelled' } });
            res.redirect(`/orderDetails/${id}`)
        } catch (error) {
        console.log(error.message);
    }
}


//Razor pay

const razorPay = async (req, res) => {
    try {
        const address=await Address.findOne({UserId:req.session.user})
        if(address.address.length>0){
        const user = await User.findOne({_id: req.body.userId})
        const amount = req.body.amount * 100
        const options = {
            amount,
            currency: "INR",
            receipt: 'sahlathasnim2002@gmail.com'
        }
        instance.orders.create(options, async(err, order) => {
            if (!err) {


                res.send({
                    succes: true,
                    msg: 'ORDER created',
                    order_id: order.id,
                    amount,
                    key_id: process.env.RAZORPAY_IDKEY,
                    name: user.FullName,
                    email: user.email
                })
            } else {
                console.error("Error creating order:", err);
                res.status(500).send({ success: false, msg: "Failed to create order" });
            }
        })
    }else{
        res.send({fail:true})
    }
    } catch (err) {
        console.log(err.message + ' razor')
    }
}




//user side return request

const returnItem=async(req,res)=>{
    try {
        const {reason,item}=req.body
        const find=await Order.findOne({'products._id':item})
        if(find){
            req.session.reason=reason
            req.session.item=item  
            
            const returnRequest = await Order.findOneAndUpdate(
                { 'products._id': item },
                { 
                    $set: { 
                        'products.$.returnReason': reason,
                    } 
                }
            )
        }

        // res.render('admin/OrderBrief', { details: returnRequest });
    } catch (error) {
        console.log(error.message);
    }
}


 
//adminside return 
 const approveReturnRequest=async(req,res)=>{
     try {
        const {returnedItem}=req.body
        const item=await Order.findOneAndUpdate({'products._id':returnedItem},{ $set: { 'products.$.status': 'returned' } })
        console.log(item,"item");
        res.send({item})
     } catch (error) {
        console.log(error.message); 
     }
 }


 //wallet 
//  const walletAmount=async(req,res)=>{
//     console.log(req.body,'req.body')
//     const {returnedItem}=req.body
//     req.session.returnedItem=returnedItem
//     console.log(req.session.returnedItem,'req.session.returnedItem');
    // const returnMoney=await Order.findOne({UserId:req.session.user,'products._id':returnedItem, 'products.status': 'returned'}).populate('products.productId')
    // console.log(returnMoney,'90909099')
    // let wallet=0
    // wallet=returnedItem.productId.Price*returnedItem.products.quantity
    // console.log(wallet)
    // res.render('user/myAccount',{wallet,returnMoney})
//  }



module.exports={
    orderProduct,
    orderList,
    OrderDetails,
    orderBrief,
    updateOrderStatus,
    orderCancel,

    //return
    returnItem,
    approveReturnRequest,

    //wallet
    // walletAmount,
    
    //razorpay
    razorPay   
}