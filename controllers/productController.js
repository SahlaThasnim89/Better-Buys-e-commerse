const Product = require('../model/productModel')
const Category = require('../model/CategoryModel')
const Offer=require('../model/offerModel')
const moment = require('moment');
const currentDate=moment(); 



const product = async (req, res) => {
    try {

        const limit=4
        const page=Number(req.query.page)||1;
        const skip=(page-1)*limit;

        const count=await Product.countDocuments()
        const pages=Math.ceil(count/limit)


        const product = await Product.find().populate('Category').skip(skip).limit(limit)
        const modifiedProducts = product.map(product => ({
            Name: product.Name,
            Description: product.Description,
            CategoryName: product.Category ? product.Category.CategoryName : 'Uncategorized', 
            Price: product.Price,
            is_listed: product.is_listed,
            Quantity: product.Quantity,
            date: product.date,
            image: product.image,
            _id: product._id,
            OfferPrice:product.OfferPrice,
            Offer:product.Offer
        }));
        const offers=await Offer.find()
        res.render('admin/products', { product: modifiedProducts ,
                                        pages,
                                        currentPage:page,
                                        offers
                                    });
    } catch (error) {
        console.error(error);
    }
};


//to add product
const addProduct = async (req, res) => {
    const category = await Category.find()
    res.render('admin/addProduct', { category })
}



//to get added product in product list
const addingProduct = async (req, res) => {
    try {
        const images = req.files.map(file => file.filename)
        const addedProduct = new Product({
            Name: req.body.productName,
            Description: req.body.description,
            Category: req.body.category,
            Price: req.body.price,
            Quantity: req.body.stock,
            date: currentDate.format('DD/MM/YYYY'),
            image: images,
            OfferPrice:req.body.price
        })
        console.log(addedProduct);
        const newCategory = await addedProduct.save()
        res.redirect('/admin/products')
    } catch (error) {
        console.log(error.message);
    }
}



//to edit product
const editProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        if (product.length === 24) {
        const msg=req.flash('err')
        const product = await Product.findOne({ _id: productId })
        const category=await Category.find()
        res.render('admin/editProduct', { product,category,msg})
        }else{
            res.redirect('/admin/error')
        }
    } catch (error) {
        console.log(error.message);
    }
}


//to get edited product data in list
const editedProductData = async (req, res) => {
    try {
        const { productName, Description, category, price, stock,id,offer } = req.body
        const newPrice=price-(price*offer/100)
        if(price<=0 || stock<0 ){
            req.flash('err','price and quantity cannot be a negative value')
            res.redirect(`/admin/editProduct/${id}`)
        }
        const image = req.files.map(file => file.filename)
        const previous=await Product.findOne({_id:req.body.id})
       
        let img=[]
        if (previous.image && previous.image.length > 0) {
        for(let i=0;i<4;i++){
            if(previous.image[i]!==req.body.pic[i]){
                image.forEach(e=>{
                    console.log(e,req.body.pic[i]);
                    if(e.split(' - ')[1]==req.body.pic[i].split(' - ')[1]){
                        img[i]=e 
                    }
                })
            }else{
                
                img[i]=previous.image[i]
            }
        }
    }
        const edited = await Product.findByIdAndUpdate({ _id: req.body.id }, {
            Name: productName,
            Description: Description,
            Category: category,
            Price: price,
            Quantity: stock,
            date: currentDate.format('DD/MM/YYYY'),
            image: img,
            OfferPrice:newPrice
        }, { new: true })
      
        if (edited) {
            res.redirect('/admin/products')
        }
    } catch (error) {
        console.log(error.message);
    }
}



//to block product
const blockProduct = async (req, res) => {
    try {
        const ProductId = req.body.id
        if (ProductId.length === 24) {
        const ProductStatus = await Product.findOne({ _id: ProductId })
        ProductStatus.is_listed = !ProductStatus.is_listed
        ProductStatus.save()
        }else{
            res.redirect('/admin/error')
        }
    } catch (error) {  
        console.log(error.message);
    }
}


//to delete product
const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id
        if (productId.length === 24) {
        const toDelete = await Product.deleteOne({ _id: productId })
        res.redirect('/admin/products')
        }else{
            res.redirect('/admin/error')
        }
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    product,
    addProduct,
    addingProduct,
    editProduct,
    editedProductData,
    blockProduct,
    deleteProduct
}