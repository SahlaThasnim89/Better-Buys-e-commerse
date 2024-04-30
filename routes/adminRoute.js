const express=require ("express")
const admin_route=express()
const path=require('path')
const multer=require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/productImage'));
  },
  filename: (req, file, cb) => {
    const name = Date.now() + ' - ' + file.originalname;
    cb(null, name);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
  
    cb(null, true);
  },
});



const adminController=require("../controllers/adminController")
const categoryController=require("../controllers/categoryController")
const productController=require('../controllers/productController')
const orderController=require('../controllers/orderController')
const coupenController=require('../controllers/coupenController')



const adminMiddleware=require("../middleware/adminMiddleware")



admin_route.get("/login",adminMiddleware.isLogout,adminController.adminLoginPage)
admin_route.post("/login",adminController.adminLogin)
admin_route.get("/",adminMiddleware.isLogged,adminController.home)
admin_route.get('/userList',adminMiddleware.isLogged,adminController.UserList)
admin_route.post('/blockUser',adminController.blockUser)
admin_route.get('/logout',adminController.logOut)


//for category
admin_route.get('/category',adminMiddleware.isLogged,categoryController.category)
admin_route.get('/addcategory',adminMiddleware.isLogged,categoryController.addCategory)
admin_route.post('/addcategory',categoryController.addCategoryData)
admin_route.post('/blockCategory',categoryController.blockCategory)
admin_route.get('/editCategory/:id',categoryController.editCategory)
admin_route.post('/editCategory/:id',categoryController.editedCategoryData)
admin_route.post('/deleteCategory/:id',categoryController.deleteCategory)

//for product
admin_route.get('/products',adminMiddleware.isLogged,productController.product)
admin_route.get('/addProduct',adminMiddleware.isLogged,productController.addProduct)
admin_route.post('/addProduct',upload.array('images',4),productController.addingProduct)
admin_route.get('/editProduct/:id',productController.editProduct)
admin_route.post('/editProduct/:id',upload.array('images',4),productController.editedProductData)
admin_route.post('/unlistProduct',productController.blockProduct)
admin_route.post('/deleteProduct/:id',productController.deleteProduct)


//admin Order List
admin_route.get('/orderList',adminMiddleware.isLogged,orderController.orderList)
admin_route.get('/orderData/:id',orderController.orderBrief)
admin_route.post('/updateOrderStatus',orderController.updateOrderStatus)
admin_route.post('/ApproveReturn',orderController.approveReturnRequest)

//for Coupen
admin_route.get('/Coupen',adminMiddleware.isLogged,coupenController.coupen)
admin_route.get('/addCoupen',adminMiddleware.isLogged,coupenController.addCoupen)
admin_route.post('/addCoupen',upload.single('images'),coupenController.coupenAdding)
admin_route.get('/editCoupen/:id',coupenController.editPage)
admin_route.post('/editCoupen/:id',coupenController.CoupenEditing)


//for offers
admin_route.get('/offers',adminMiddleware.isLogged,adminController.Offers)
admin_route.get('/addOffer',adminMiddleware.isLogged,adminController.forAddOffer)
admin_route.post('/addOffer',adminController.AddingOffer)
admin_route.get('/editOffer/:id',adminController.EditPage)
admin_route.post('/editOffer/:id',adminController.editOffer)
admin_route.post('/deleteOffer/:id',adminController.removeOffer)


//for invoice
 admin_route.get('/invoiceList',adminController.invoiceList)
 admin_route.get('/invoiceDetails',adminController.invoiceDetails)



module.exports=admin_route