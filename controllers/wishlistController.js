
const User=require('../model/userModel')
const Product=require('../model/productModel');
const  Wishlist= require('../model/wishlistModel')


const wishList=async(req,res)=>{
    try {
        const {user}=req.session
        const wishlist= await Wishlist.findOne({UserId:user}).populate('products.ProductId')
        // console.log(wishlist,'drdrdrdrrdrrdd');
        res.render('user/wishlist',{data:wishlist})
    } catch (error) {
        console.log(error.message);
    }
}



const addToWishlist=async(req,res)=>{
    try {
        const id=req.body.id
        const data=await Product.findOne({_id:id})
        const already=await Wishlist.findOne({
            UserId: req.session.user,
            products:{
                $elemMatch:{
                    ProductId:id 
                }
            }
        })
        if(!already){
            const addNew=await Wishlist.findOneAndUpdate(
                {UserId:req.session.user},
                {$addToSet:{products:{ProductId:id}}},
                {new:true, upsert:true}
            );
        }else{
            res.send({set:'already added'})
        }
    }catch (error) {
        console.log(error.message);
    }
}



const removeItem=async(req,res)=>{
    try {
        const {remove}=req.body
        const find=await Wishlist.findOneAndUpdate(
            {UserId:req.session.user},
            {$pull:{products:{ProductId:remove}}})
            // console.log(find,'find');
            res.redirect('/wishlist')
    } catch (error) {
        console.log(error.message);
    }
}


module.exports={
        wishList,
        addToWishlist,
        removeItem

}
