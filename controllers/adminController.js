const User = require("../model/userModel")
const Product = require('../model/productModel')
const Category = require('../model/CategoryModel')
const Offer = require('../model/offerModel')
const Order = require('../model/orderModel')
const { OrderDetails } = require("./orderController")


//for admin login
const adminLoginPage = async (req, res) => {
    res.render('admin/login')
}

const adminid = {
    email: "sahlathasnim2002@gmail.com",
    password: "Sahla@2002"
}

const adminLogin = async (req, res) => {
    if (req.body.email === adminid.email) {
        if (req.body.password === adminid.password) {
            req.session.admin = adminid.email
            res.redirect('/admin')
        } else {
            res.redirect("/admin/login")
        }
    } else {
        res.redirect("/admin/login")
    }

}

const home = async (req, res) => {
    try {
        const sales = await Order.find().populate('UserId').populate({
            path: 'products.productId',
            populate: {
                path: 'Category',
                select: 'CategoryName'
            }
        })
        const orderCount = await Order.find().countDocuments()
        const user = await User.find().count()
        //revenue
        const totalOrders = await Order.aggregate([
            {
                $match: {
                    'products.status': 'delivered'
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$orderAmount' }
                }
            }
        ]);
        const revenue = totalOrders[0].totalAmount;

        //total
        const total = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$orderAmount' }
                }
            }
        ]);
        const Total = total[0].totalAmount;

        //most repeated product
        const mostRepeatedProduct = await Order.aggregate([
            { $unwind: '$products' },
            {
                $group: {
                    _id: '$products.productId',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]);
        const ProductId = mostRepeatedProduct[0]._id
        const ProductCount = mostRepeatedProduct[0].count

        const product = await Product.findOne({ _id: ProductId })
        const prod = product.Name

        //total products
        const totalProducts = await Order.aggregate([
            { $unwind: '$products' },
            { $group: { _id: null, totalProducts: { $sum: 1 } } }
        ]);
        const totaProducts = totalProducts[0].totalProducts

        //status counts
        const statusCounts = await Order.aggregate([
            { $unwind: '$products' },
            {
                $group: {
                    _id: '$products.status',
                    count: { $sum: 1 }
                }
            }
        ]);

        //category count
        const CountByCategory = await Order.aggregate([
            { $unwind: '$products' },
            {
                $lookup: {
                    from: 'products',
                    localField: 'products.productId',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            { $unwind: '$productDetails' },
            {
                $lookup: {
                    from: 'categories',
                    localField: 'productDetails.Category',
                    foreignField: '_id',
                    as: 'categoryDetails'
                }
            },
            { $unwind: '$categoryDetails' },
            {
                $match: {
                    'categoryDetails.CategoryName': { $in: ['men', 'women'] }
                }
            },
            {
                $group: {
                    _id: '$categoryDetails.CategoryName',
                    count: { $sum: 1 }
                }
            }
        ]);

        //top 10 products
        const bestSellingTen = await Order.aggregate([
            { $unwind: '$products' },
            {
                $group: {
                    _id: '$products.productId',
                    totalQuantitySold: { $sum: '$products.quantity' },
                    orderCount: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            { $unwind: '$productDetails' },
            {
                $project: {
                    productId: '$_id',
                    productName: '$productDetails.Name',
                    productImage: '$productDetails.image',
                    productPrice: '$productDetails.OfferPrice',
                    totalQuantitySold: 1,
                    orderCount: 1
                }
            },
            { $sort: { orderCount: -1 } },
            { $limit: 10 }
        ]);


        //Top Users
        const topUsers = await Order.aggregate([
            {
                $group: {
                    _id: '$UserId',
                    totalAmountSpent: { $sum: '$orderAmount' },
                    orderCount: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'userDetails'
                }
            },
            { $unwind: '$userDetails' },
            {
                $project: {
                    userName: '$userDetails.FullName',
                    orderCount: 1,
                    totalAmountSpent: 1
                }
            },
            { $sort: { totalAmountSpent: -1 } },
            { $limit: 5 }
        ]);


        //pending orders
        const countPending = await Order.countDocuments({ status: 'pending' });
        
        
        //order of the day
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const CurrentDayOrders = await Order.find({
            orderDate: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        }).count();
       





        res.render('admin/homepage', { sales, orderCount, user, revenue, Total, ProductCount, prod, product, statusCounts, CountByCategory, totaProducts, bestSellingTen, topUsers, countPending,CurrentDayOrders })
    } catch (error) {
        console.log(error.message);
    }
}


const UserList = async (req, res) => {
    try {
        const limit = 4
        const page = Number(req.query.page) || 1;
        const skip = (page - 1) * limit;

        const count = await User.countDocuments()
        const pages = Math.ceil(count / limit)
        const user = await User.find().skip(skip).limit(limit)
        res.render('admin/userList', {
            user, pages,
            currentPage: page
        })
    } catch (error) {
        console.log(error.message);
    }
}

// to block a user
const blockUser = async (req, res) => {
    try {
        const userId = req.body.id;
        let check = await User.findOne({ _id: userId })
        check.is_blocked = !check.is_blocked;
        check.save()

    } catch (error) {
        console.log(error.message);
    }

}


const logOut = async (req, res) => {
    delete req.session.admin
    res.redirect('/admin/login')
}



//for offers

const Offers = async (req, res) => {
    try {
        const offers = await Offer.find({ discount: { $gt: 0 } })
        res.render('admin/Offer', { offers })
    } catch (error) {
        console.log(error.message)
    }
}


const forAddOffer = async (req, res) => {
    try {
        res.render('admin/addOffer')
    } catch (error) {
        console.log(error.message);
    }
}


const AddingOffer = async (req, res) => {
    try {
        const { name, discount } = req.body
        // const check=await Offer.find({})
        const offerData = new Offer({
            offerName: name,
            discount: discount,
        })
        await offerData.save()
        res.redirect('/admin/offers')
    } catch (error) {
        console.log(error.message);
    }
}


//offer edit
const EditPage = async (req, res) => {
    try {
        let offerId = req.params.id
        const offer = await Offer.findOne({ _id: offerId })
        res.render('admin/editOffer', { offer })
    } catch (error) {
        console.log(error.message);
    }
}


const editOffer = async (req, res) => {
    try {
        const OfferId = req.params.id
        const { offername, discount, oldDiscount } = req.body
        const check = await Offer.findOne({ discount: discount })
        if (!check) {
            const edit = await Offer.findByIdAndUpdate({ _id: OfferId }, {
                $set: {
                    offername: offername,
                    discount: discount,
                }
            }, { new: true })

            const already = await Category.find({ Offer: oldDiscount })
            for (const cate of already) {
                await Category.updateOne({ _id: cate._id }, { $set: { Offer: discount } })
            }

            const alread = await Product.find({ Offer: oldDiscount })
            for (const prod of alread) {
                const offPrice = prod.Price * prod.Offer / 100
                const newPrice = prod.Price - offPrice
                await Product.updateOne({ _id: prod._id }, { $set: { Offer: discount, OfferPrice: newPrice } })
            }

            res.redirect('/admin/offers')
        }
    } catch (error) {
        console.log(error.message);
    }
}



const removeOffer = async (req, res) => {
    try {
        const id = req.params.id
        const toDelete = await Offer.deleteOne({ _id: id })
        res.redirect('/admin/offers')
    } catch (error) {
        console.log(error.message);
    }

}

const productOffer = async (req, res) => {
    try {
        const { productId, offer } = req.body
        const item = await Product.findOne({ _id: productId })
        let price = Math.round(item.Price - (item.Price * offer / 100))
        await Product.findOneAndUpdate({ _id: productId }, { $set: { Offer: offer, OfferPrice: price } })
        res.send({ price })
    } catch (error) {
        console.log(error.message);
    }
}

const CategoryOffer = async (req, res) => {
    try {
        const { categoryId, offer } = req.body
        await Category.findOneAndUpdate({ _id: categoryId }, { $set: { Offer: offer } })
        const Item = await Product.find({ Category: categoryId })
        for (const item of Item) {
            const price = Math.round(item.Price - (item.Price * offer / 100));
            await Product.updateOne({ _id: item._id }, { $set: { Offer: offer, OfferPrice: price } });
        }
    } catch (error) {
        console.log(error.message);
    }
}

//Invoice
const invoiceList = async (req, res) => {
    try {
        res.render('admin/invoiceList')
    } catch (error) {
        console.log(error.message);
    }
}

const invoiceDetails = async (req, res) => {
    try {
        res.render('admin/invoiceDetails')
    } catch (error) {
        console.log(error.message);
    }
}

//sales report

const salesReport = async (req, res) => {
    try {
        const limit = 10;
        const page = Number(req.query.page) || 1;
        const skip = (page - 1) * limit;
        const basis = req.params.id;

        let order;
        let customDate
        if (basis) {
            // Create date ranges based on the basis provided
            const range = {};
            const date = new Date();
            switch (basis) {
                case "daily":
                    range.start = new Date(date.setHours(0, 0, 0, 0));
                    range.end = new Date(date.setHours(23, 59, 59, 999));
                    break;


                case "weekly":
                    const today = new Date();
                    const dayOfWeek = today.getDay();

                    const startOfWeek = new Date(today);
                    startOfWeek.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));

                    const endOfWeek = new Date(startOfWeek);
                    endOfWeek.setDate(startOfWeek.getDate() + 6);

                    range.start = startOfWeek;
                    range.end = endOfWeek;
                    break;


                case "monthly":
                    range.start = new Date(date.getFullYear(), date.getMonth(), 1);
                    range.end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                    break;

                case "yearly":
                    range.start = new Date(date.getFullYear(), 0, 1);
                    range.end = new Date(date.getFullYear(), 11, 31);
                    break;

                case "customDate":
                    customDate = 'customDate'
                    range.start = new Date(date.getFullYear(), date.getMonth(), 1);
                    range.end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                    break;

                default:
                    throw new Error("Invalid report basis");
            }

            order = await Order.find({
                orderDate: { $gte: range.start, $lt: range.end },
            })
                .populate("UserId products.productId")
                .skip(skip)
                .limit(limit);
        } else {
            order = await Order.find()
                .populate("UserId products.productId")
                .skip(skip)
                .limit(limit);
        }

        res.render("admin/salesReport", { order, customDate });
    } catch (error) {
        console.error("Error generating sales report:", error.message);
    }
};


const getcustomDate = async (req, res) => {
    try {
        const { startDate, endDate } = req.body
        console.log(startDate, endDate, 'opop');
        let order;
        const range = {};
        const start = new Date(startDate);
        const end = new Date(endDate);

        range.start = new Date(start.getFullYear(), start.getMonth(), 1);
        range.end = new Date(end.getFullYear(), end.getMonth() + 1, 0);

        order = await Order.find({
            orderDate: { $gte: range.start, $lt: range.end },
        })
            .populate("UserId products.productId")

    } catch (error) {
        console.log(error.message);
    }
}

const returnList = async (req, res) => {
    try {
        const limit = 6
        const page = Number(req.query.page) || 1;
        const skip = (page - 1) * limit;

        const count = await Order.countDocuments()
        const pages = Math.ceil(count / limit)
        const returnrequest = await Order.find({
            $and: [
                { 'products.returnReason': { $exists: true, $ne: '' } },
                { 'products.status': { $ne: 'returned', $eq: 'delivered' } }
            ]
        }).populate('UserId products.productId').sort({ orderDate: -1 }).skip(skip).limit(limit);
        res.render("admin/returnList", {
            returnrequest, pages,
            currentPage: page
        })
    } catch (error) {
        console.log(error.message);
    }
}


//chart
const chart = async (req, res) => {
    try {
        let array = Array.from({ length: 12 }).fill(0);

        const currentYear = new Date().getFullYear();

        const chartData = await Order.aggregate([
            {
                $match: {
                    orderDate: {
                        $gte: new Date(currentYear, 0, 1),
                        $lte: new Date(currentYear, 11, 31, 23, 59, 59, 999)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$orderDate" },
                    totalOrders: { $sum: 1 }
                }
            },
        ]);


        for (let i = 0; i < array.length; i++) {
            for (let j = 0; j < chartData.length; j++) {
                if (i + 1 === chartData[j]._id) {
                    array[i] = chartData[j].totalOrders;
                    break;
                }
            }
        }

        res.send({ array })
    } catch (error) {
        console.log(error.message);
    }
}




module.exports = {
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
    productOffer,
    CategoryOffer,

    // Invoice
    invoiceList,
    invoiceDetails,

    //salesReport
    salesReport,
    getcustomDate,

    //return
    returnList,

    //chart
    chart


}