const User= require("../model/userModel")
const Product = require('../model/productModel')
const Category = require('../model/CategoryModel')
const Offer=require('../model/offerModel')
const Order=require('../model/orderModel')
const { OrderDetails } = require("./orderController")


//for admin login
const adminLoginPage=async(req,res)=>{
    res.render('admin/login')   
}

const adminid={
    email:"sahlathasnim2002@gmail.com",
    password:"Sahla@2002"
}

const adminLogin=async(req,res)=>{
            if(req.body.email===adminid.email){
                if(req.body.password===adminid.password){    
                    req.session.admin=adminid.email             
                    res.redirect('/admin')
                }else{
                res.redirect("/admin/login")
            }
        }else{
            res.redirect("/admin/login")
        }
      
}

const home=async(req,res)=>{
    try {
        const sales=await Order.find().populate('UserId').populate({path: 'products.productId',
                                                                     populate: {
                                                                     path: 'Category', 
                                                                        select: 'CategoryName'
            }
        })
        res.render('admin/homepage',{sales
                                })
    } catch (error) {
        console.log(error.message);
    }
}


const UserList=async(req,res)=>{
    const user=await User.find()
    res.render('admin/userList',{user})
}

// to block a user
const blockUser=async(req,res)=>{
     try {
        const userId=req.body.id;
        let check=await User.findOne({_id:userId})
        check.is_blocked=!check.is_blocked;
        check.save()
           
     } catch (error) {
         console.log(error.message);
     }

 }

 
const logOut=async(req,res)=>{
    delete req.session.admin
    res.redirect('/admin/login')
}



//for offers

const Offers=async(req,res)=>{
    try {
        const offers=await Offer.find().populate('productId').populate('categoryId');
        res.render('admin/Offer',{offers})
    } catch (error) {
        console.log(error.message)
    }
}


const forAddOffer=async(req,res)=>{
    try {
        const category=await Category.find()
        const product=await Product.find({is_listed:true})
       res.render('admin/addOffer',{product,category}) 
    } catch (error) {
        console.log(error.message);
    }
}


const AddingOffer=async(req,res)=>{
    try {
        const {name,discount,validity,type,TypeName}=req.body
        const check=await Offer.find({})
        const validTypeName = TypeName.find((item) => item && item.trim() !== '');
        const offerData={
        offerName:name,
        discount:discount,
        expiry:validity,
        Type:type
        }
        if (type === "product") {
            offerData.productId = validTypeName;
          } else if (type === "category") {
            offerData.categoryId = validTypeName;
          }
          const offer = new Offer(offerData);
    const currentOffer=await offer.save()
    const OfferedItem=[]
    res.redirect('/admin/offers')
    } catch (error) {
        console.log(error.message);
    }
}


    //offer edit
const EditPage=async(req,res)=>{
    try {
        let offerId=req.params.id
        const offer=await Offer.findOne({_id:offerId})
        res.render('admin/editOffer',{offer})
    } catch (error) {
        console.log(error.message);
    }
}


const editOffer=async(req,res)=>{
    try {
        const OfferId=req.params.id
        const {offername,discount,valid}=req.body
        const check=await Offer.findOne({offername: { $regex: new RegExp(offername, "i")}})
        if(!check){
            const edit=await Offer.findByIdAndUpdate({_id:OfferId},{
                offername:offername,
                discount:discount,
                valid:valid,
                Type:type,
                Item:Item[0]
            },{new:true})
            if(edit){
                res.redirect('/admin/offers')
            }
            }
    } catch (error) {
        console.log(error.message);
    }
}



const removeOffer=async(req,res)=>{
    try {
        const id=req.params.id
        const toDelete=await Offer.deleteOne({_id:id})
        res.redirect('/admin/offers')
    } catch (error) {
        console.log(error.message);
    }
   
}

//Invoice
 const invoiceList=async(req,res)=>{
     try {
         res.render('admin/invoiceList')
     } catch (error) {
         console.log(error.message);
     }
 }

 const invoiceDetails=async(req,res)=>{
    try {
        res.render('admin/invoiceDetails')
    } catch (error) {
        console.log(error.message);
    }
 }



module.exports={
    adminLoginPage,
    adminLogin,
    home,
    UserList,
    blockUser,
    logOut,


    //offers
    Offers,
    forAddOffer,
    AddingOffer,
    EditPage,
    editOffer,
    removeOffer,

    // Invoice
    invoiceList,
    invoiceDetails


}