const Product = require('../model/productModel')
const User=require('../model/userModel')
const Address=require('../model/addressModel')
const Order=require('../model/orderModel')
const Coupen=require('../model/coupenModel')
const Cart=require('../model/cartModel')
const bcrypt=require("bcrypt")
const session=require('express-session')
const Offer=require('../model/offerModel')
const Wallet=require('../model/walletModel')


const myAccount=async(req,res)=>{
    const customer=await User.findOne({_id:req.session.user}).populate({path:'coupen.coupenId',model:'Coupen'})
    const addr=await Address.find({UserId:req.session.user})
    const order=await Order.find({UserId:req.session.user}).populate('products.productId').sort({orderDate:-1})
    const returnedOrder=await Order.find({UserId:req.session.user, 'products.status': 'returned'}).populate('products.productId')
    const offersFound = await Offer.find();
    const wallet=await Wallet.findOne({userId:req.session.user}).sort({'transaction.returnDate':-1})
    let total=0

        returnedOrder.forEach((item) => {
            //const price = item.productId ? item.productId.Price : 0;
            const quantity = Number(item.products[0].quantity);
            const price = Number(item.products[0].productId.OfferPrice);  
            total += price * quantity; 
        })


        //refferral
        const baseURL = "http://localhost:3000/register";
        const referralCode =await User.findOne({_id:req.session.user})
        const referralLink = `${baseURL}?ref=${referralCode._id}`;
        const link=await User.findOneAndUpdate({_id:referralCode._id},{$set:{refferalLink:referralLink}},{new:true})    


    const msg=req.flash('msg')
    res.render('user/myAccount',{msg,addr,Orders:order,returnedOrder,total,customer,link,wallet})
}


const resetPassword=async(req,res)=>{
    try {
        const {currentPwd,newPwd}=req.body
        const newPw=await bcrypt.hash(newPwd,10)
        const check=await User.findOne({_id:req.session.user})
        if(check){
           const passwordCheck=await bcrypt.compare(currentPwd,check.password)
           if(passwordCheck){
            const newPass=await User.findByIdAndUpdate({_id:req.session.user},{$set:{password:newPw}})
            res.redirect('/myAccount')
           }else{
                req.flash('msg','incorrect password')
                console.log(req.flash('msg'));
                res.redirect('/myAccount')
           }
        }
    } catch (error) {
        console.log(error.message);
    }
}




const addAddress=async(req,res)=>{
    try {
    const{name,mobile,email,pincode,locality,address,city,state}=req.body
    const check=await Address.findOne({
        UserId:req.session.user,
        address:{
            $elemMatch:{
                locality:locality}
            }
        })
    if(!check){
        const add=await Address.findOneAndUpdate({UserId:req.session.user},
                                                {$addToSet:
                                                    {address:
                                                        {name:name,
                                                            mobile:mobile,
                                                            email:email,
                                                            pincode:pincode,
                                                            locality:locality,
                                                            addressData:address,
                                                            city:city,
                                                            state:state
                                                        }}},
                                             {new:true,upsert:true})
        res.redirect('/myAccount')
    } else{
        req.flash('msg','address already exist')
        res.redirect('/myAccount')
    }
    }catch (error) {
        console.log(error.message);
        }
    }


    const editAddressPage=async(req,res)=>{
        try {
            const{id}=req.body

            const dataToEdit=await Address.findOne({'address._id':id},{'address.$':1})
            res.json({dataToEdit})
        } catch (error) {
            console.log(error.message);
        }
    }




    const updateAddress=async(req,res)=>{
        try {
            const {user}=req.session
            const{name,mobile,email,pincode,locality,address,city,state,id}=req.body
            const update=await Address.findOneAndUpdate({UserId:user, 'address._id':id},
            {
                $set: {
                    'address.$.name': name,
                    'address.$.mobile': mobile,
                    'address.$.pincode': pincode,
                    'address.$.email': email,
                    'address.$.locality': locality,
                    'address.$.addressData': address,
                    'address.$.city': city,
                    'address.$.state': state
                }
            })
            res.redirect('/myAccount')
        } catch (error) {
            console.log(error.message);
        }
    }

  
    const deleteAddress=async(req,res)=>{
        try {
            const {del}=req.body
            const remove=await Address.findOneAndUpdate({'address._id':del},{$pull:{address:{_id:del}}})
            res.json({remove})
        } catch (error) {
            console.log(error.message);
        }
    }




module.exports={
    myAccount,
    resetPassword,
    addAddress,
    editAddressPage,
    updateAddress,
    deleteAddress
}

