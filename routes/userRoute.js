const express=require("express")
const user_route=express()
const nodemailer=require('nodemailer')
const randomstring=require('randomstring')
const googleLogin=require('../passport')
require('dotenv').config()




const userController=require("../controllers/userController")
const cartController=require('../controllers/cartController')
const userProfileController=require('../controllers/userProfileController')
const orderController=require('../controllers/orderController')
const wishlistController=require('../controllers/wishlistController')
const CoupenController=require('../controllers/coupenController')


const userMiddleware=require("../middleware/userMiddleware")




user_route.get("/",userController.home)
user_route.get("/register",userMiddleware.isLogout,userController.registrationForm)
user_route.post("/register",userController.insertUser)
user_route.get("/otp",userController.otpPage)
user_route.post("/otp",userController.EnteredOTP)
user_route.get('/resendOtp',userController.resendOtp)
user_route.get("/login",userMiddleware.isLogout,userController.loginload)
user_route.post("/login",userController.loginUser)
user_route.get("/logout",userController.Logout)
user_route.get('/forgetpw',userController.forgetpw)
user_route.post('/forgetpw',userController.getEmail)
user_route.post('/resetpw',userController.fpReset)

//minicart
user_route.post('/miniCart', userController.miniCart); 

//shop
user_route.get('/shop', userController.unifiedShop); 
// user_route.get('/shop', userController.shoplist); 
// user_route.get('/sort/:id',userController.lowTohigh) 
// user_route.get('/cate/:id',userController.categoryWise) 
user_route.get('/product/:id',userController.singleProduct)

//cart
user_route.get('/cart',userMiddleware.isLogged,cartController.cartPage)
user_route.post('/addtoCart',cartController.addtoCart)
user_route.post('/updateQty',cartController.qtyControll)
user_route.post('/deleteCart',cartController.deleteItem)



//checkout
user_route.get('/checkOut',userMiddleware.isLogged,cartController.checkout)
user_route.post('/billingAddress',cartController.billingAddress)
user_route.post('/selectAddress',cartController.selectAddress)
user_route.post('/editCheckoutAddress',cartController.editCheckAddress)
user_route.post('/update',cartController.edited)




//userProfile
user_route.get('/myAccount',userMiddleware.isLogged,userProfileController.myAccount)
user_route.post('/reset',userMiddleware.isLogged,userProfileController.resetPassword)
user_route.post('/addAddress',userProfileController.addAddress)
user_route.post('/editAddresspage',userProfileController.editAddressPage)
user_route.post('/updateAddress',userProfileController.updateAddress)
user_route.post('/deleteAddress',userProfileController.deleteAddress)




//order
user_route.post('/order',orderController.orderProduct)
user_route.get('/orderDetails/:id',userMiddleware.isLogged,orderController.OrderDetails)
user_route.post('/cancelOrder',orderController.orderCancel)
user_route.post('/returnOrder',orderController.returnItem)
user_route.post('/razorPay',orderController.razorPay)
// user_route.post('/successPayment',orderController.SuccessPayment)

//retry Payment
user_route.post('/retryPayment',orderController.retryPayment)
//retry success
user_route.post('/retrySuccess',orderController.retryUpdate)




//blog
user_route.get('/blog',userMiddleware.isLogged,userController.blog)
//contact
user_route.get('/contact',userMiddleware.isLogged,userController.Contact)


//wishlist
user_route.get('/wishlist',userMiddleware.isLogged,wishlistController.wishList)
user_route.post('/addtoWishlist',wishlistController.addToWishlist)
user_route.post('/removeItem',wishlistController.removeItem)


//coupen
user_route.post('/applyCoupen',cartController.applyCoupen)

//for invoice
user_route.get('/invoice/:id',userMiddleware.isLogged,orderController.invoice)


// thanks
user_route.get('/thanks',userMiddleware.isLogged,userController.thanks)




//google login
user_route.get('/auth/google', googleLogin.googleAuth);
user_route.get("/auth/google/callback", googleLogin.googleCallback, googleLogin.setupSession);



// 404
user_route.get('/error',userController.page404)




module.exports=user_route