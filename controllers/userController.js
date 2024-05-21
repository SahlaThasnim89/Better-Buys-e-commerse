const User = require("../model/userModel")
const bcrypt = require("bcrypt")
const nodemailer = require("nodemailer")
const Product = require("../model/productModel")
const Offer = require('../model/offerModel')
const Category = require('../model/CategoryModel')
const Cart = require('../model/cartModel')
const Wallet = require('../model/walletModel')



const home = async (req, res) => {
    try {
        const activeProd = await Product.find({ is_listed: true });
        const cart = await Cart.findOne({ clientId: req.session.user }).populate('products.productId');

        if (!cart) {
            console.error('Cart not found for user:', req.session.user);
            return res.render("user/homepage", { haveuser: req.session.user, product: activeProd, cart: [] });
        }
        if (!cart.products || cart.products.length === 0) {
            console.error('No products in the cart');
            return res.render("user/homepage", { haveuser: req.session.user, product: activeProd, cart: [] });
        }

        const products = cart.products;
        res.render("user/homepage", { haveuser: req.session.user, product: activeProd, cart: products });

    } catch (error) {
        console.error('Error in home function:', error);
        req.flash('msg', 'An error occurred while loading the homepage.');
    }
};


//for registration form
const registrationForm = async (req, res) => {
    try {
        const linkId = req.query.ref
        const referer = await User.findOne({ _id: linkId })
        if(referer){
        req.session.refferer = referer._id
        }
        const msg = req.flash('err')
        res.render("user/register", { msg })
    } catch (error) {
        console.log(error.message);
    }
}


const otpPage = async (req, res) => {
    const msg = req.flash('err')
    res.render('user/otp_page', { msg })
}




const firstNameRegex = /^[a-zA-Z]+(?: [a-zA-Z]+)*$/;
const lastNameRegex = /^[a-zA-Z]+(?: [a-zA-Z]+)*$/;
const emailRegex = /^[A-Za-z0-9.%+-]+@gmail\.com$/;
const mobileRegex = /^\d{10}$/;



//to get datails from form
const insertUser = async (req, res) => {
    try {
        const { firstName, lastName, email, mobile, password, confirmPassword } = req.body
        if (password !== confirmPassword) {

            req.flash("err", "Passwords do not match");
            return res.redirect('/register')
        }

        if (!firstNameRegex.test(firstName)) {
            const errormsg = "Invalid Details";
            req.flash("err", errormsg);
            return res.redirect('/register');
        }
        if (!lastNameRegex.test(lastName)) {
            return res.redirect('/register');
        }
        if (!emailRegex.test(email)) {
            return res.redirect('/register');
        }
        if (!mobileRegex.test(mobile)) {
            return res.redirect('/register');
        }


        const passwordHash = await bcrypt.hash(password, 10);
        const FullName = firstName + " " + lastName
        const userData = { FullName, email, mobile, password: passwordHash }
        req.session.userData = userData
        req.session.otp = generateOTP();
        console.log(req.session.otp);
        await OtpMailSending(req.session.userData, req.session.otp);
        res.redirect("/otp")
    } catch (error) {
        console.log(error.message);
    }
}


const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000);
}

function combineOTP(parts) {
    return parts.join("")
}



const OtpMailSending = async (userData, otp) => {
    try {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'sahlathasnim2002@gmail.com',
                pass: 'zcvb kmwl uzmo vyza',
            },
        })

        const mailOptions = {
            from: 'sahlathasnim2002@gmail.com',
            to: userData.email,
            subject: 'Your OTP for registration',
            text: `Your OTP is:${otp}`
        }

        const info = await transporter.sendMail(mailOptions)
        console.log(`Email sent:${info}`);
    } catch (error) {
        console.log(error.message);
    }
}


const EnteredOTP = async (req, res) => {
    try {
        const otpParts = [
            req.body.digit1,
            req.body.digit2,
            req.body.digit3,
            req.body.digit4
        ]
        const enteredOTP = combineOTP(otpParts)

        if (req.session.otp && req.session.otpTimestamp) {
            const storedOTP = req.session.otp;
            console.log(storedOTP,'otp');
            const otpTimestamp = req.session.otpTimestamp;

          
            const currentTime = new Date();
            const differenceInMs = currentTime - otpTimestamp;
            const differenceInMinutes = differenceInMs / (1000 * 60); 

            if (differenceInMinutes > 1) {
                req.flash('err', 'OTP has expired');
                res.redirect('/otp');
                return;
            }


            // Check entered OTP is valid
            if (enteredOTP == storedOTP) {
                const user = new User(req.session.userData)
                await user.save();
                req.session.user = user._id
                const wallet=new Wallet({userId:req.session.user})
                await wallet.save()
                const find = await User.findOne({ _id: req.session.refferer })
                if (find) {
                    const refferringBonus = await Wallet.findOneAndUpdate({ userId: find._id },
                        {
                            $inc: { balance: 100 },
                            $push: {
                                transaction: {
                                    amount: 100,
                                    type: 'credit',
                                    description: 'Refferal Bonus'
                                }
                            }
                        },
                        { new: true, upsert: true }
                    );

                    const ReferrelBonus = await Wallet.findOneAndUpdate({ userId: req.session.user },
                        {
                            $inc: { balance: 50 },
                            $push: {
                                transaction: {
                                    amount: 50,
                                    type: 'credit',
                                    description: 'Welcome Bonus'
                                }
                            }
                        },
                        { new: true, upsert: true }
                    );
                }
                req.session.refferer = null
                res.redirect('/')
            } else {
                req.flash('err', 'OTP is incorrect');
                res.redirect('/otp')
            }

        } else {
            const stored = req.session.otpforget
            if (enteredOTP == stored) {
                res.render('user/forgotReset')
            } else {
                req.flash('err', 'OTP is incorrect');
                res.redirect('/otp')
            }
        }

        req.session.otp = null;
        req.session.otpTimestamp = null;


    } catch (error) {
        console.log(error.message);
    }
}


const resendOtp = async (req, res) => {
    try {
        req.session.otp = undefined
        if (req.session.otp === undefined) {
            req.session.otp = generateOTP()
            await OtpMailSending(req.session.userData, req.session.otp);
            res.redirect('/otp')
        }
    } catch (error) {
        console.log(error.message);
    }
}


const loginload = async (req, res) => {
    try {
        const msg = req.flash('err')
        res.render('user/login', { msg })
    } catch (error) {
        console.log(error.message);
    }
}


const loginUser = async (req, res) => {
    try {
        const checkUser = await User.findOne({ email: req.body.email })
        if (checkUser) {
            if (checkUser.is_blocked === false) {
                const passwordcheck = await bcrypt.compare(req.body.password, checkUser.password)
                if (passwordcheck) {
                    req.session.user = checkUser._id
                    res.redirect('/')
                } else {
                    const errormsg = "Password is invalid";
                    req.flash("err", errormsg);
                    res.redirect('/login')
                }
            } else {
                const errormsg = "You cannot purchase more";
                req.flash("err", errormsg);
                res.redirect('/login')
            }
        } else {
            const errormsg = "Email is not found";
            req.flash("err", errormsg);
            res.redirect('/login')
        }

    } catch (error) {
        console.log(error.message);
    }
}


const forgetpw = (req, res) => {
    const msg = req.flash('err')
    res.render('user/email', { msg })
}


const getEmail = async (req, res) => {
    try {
        const email = await User.findOne({ email: req.body.email })
        if (email) {
            req.session.emailforget = req.body.email
            if (email) {
                req.session.otpforget = generateOTP()
                console.log(req.session.otpforget);
                OtpMailSending(email, req.session.otpforget)
                res.redirect('/otp')
            }
        } else {
            const errormsg = "Email not registered";
            req.flash("err", errormsg);
            res.redirect('/forgetpw')
        }
    }
    catch (error) {
        console.log(error.message);
    }
}


const fpReset = async (req, res) => {
    try {
        const newPw = await bcrypt.hash(req.body.password, 10)
        const id = await User.findOneAndUpdate({ email: req.session.emailforget }, { $set: { password: newPw } })
        res.redirect('/login')
    } catch (error) {
        console.log(error.message);
    }

}


//mini cart
const miniCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ clientId: req.session.user }).populate('products.productId');
        console.log(cart);
        if (cart) {
            res.send({cart})
        } else {
            res.send({ set: 'No products in cart' })
        }

    } catch (error) {
        console.log(error.message);
    }
}

//shop page
const unifiedShop = async (req, res) => {
    try {
        const limit = 12;
        const page = Number(req.query.page) || 1;
        const skip = (page - 1) * limit;

        const sortOptions = {
            lowtoHigh: { Price: 1 },
            highTolow: { Price: -1 },
            alphabetic: { Name: 1 },
            reverseAplphabet: { Name: -1 },
            latest: { _id: -1 }
        };

        const sort = sortOptions[req.query.sort] || { Name: -1 };

        let query = { is_listed: true };

        if (req.query.category) {
            const categoryName = req.query.category;
            const productsInCategory = await Product.aggregate([
                {
                    $lookup: {
                        from: 'categories',
                        localField: 'Category',
                        foreignField: '_id',
                        as: 'category',
                    },
                },
                { $unwind: '$category' },
                {
                    $match: {
                        'category.CategoryName': categoryName,
                        is_listed: true,
                    },
                },
            ]);

            const productIds = productsInCategory.map(p => p._id);
            query._id = { $in: productIds };
        }

        if (req.query.search) {
            const content = new RegExp(`.*${req.query.search.trim()}.*`, 'i');
            query = {
                $and: [
                    query,
                    { $or: [{ Name: content }] },
                ],
            };
        }

        const count = await Product.countDocuments(query);
        const pages = Math.ceil(count / limit);

        let products = await Product.find(query)
            .populate('Category')
            .skip(skip)
            .limit(limit)
            .sort(sort);

        const noMatchingItems = products.length === 0;
        const offersFound = await Offer.find();
        const cart = await Cart.findOne({ clientId: req.session.user }).populate('products.productId');

        res.render('user/shop', {
            productAdmin: products,
            pages,
            currentPage: page,
            noMatchingItems,
            offersFound,
            cart: cart ? cart.products : [],
        });

    } catch (error) {
        console.log(error.message);
        res.status(500).send("An error occurred");
    }
};








const singleProduct = async (req, res) => {
    try {
        const product = req.params.id
        if (product.length === 24) {
            const selected = await Product.findOne({ _id: product }).populate('Category')
            const related = await Product.find()
            if (selected) {
                const relatedProducts = related
                    .filter(
                        (prod) =>
                            prod.Category._id.toString() === selected.Category._id.toString() &&
                            prod._id.toString() !== selected._id.toString()
                    )
                    .slice(0, 5);


                function getLastWord(str) {
                    const words = str.trim().split(/\s+/);
                    return words[words.length - 1];
                }

                const selectedProductName = selected.Name;
                const lastWordOfSelected = getLastWord(selectedProductName);

                const relatedItem = related
                    .filter((prod) => {
                        const lastWordOfProduct = getLastWord(prod.Name);
                        return lastWordOfProduct === lastWordOfSelected && prod._id.toString() !== selected._id.toString();
                    })
                    .slice(0, 5);


                const offersFound = await Offer.find()
                res.render('user/productDesc', {
                    data: selected,
                    offersFound,
                    relatedProducts,
                    relatedItem
                })
            } else {
                res.redirect('/error')
            }
        } else {
            res.redirect('/error')
        }

    } catch (error) {
        console.log(error.message);
    }

}



const Logout = async (req, res) => {
    req.session.user = null
    res.redirect('/')
}


const thanks = async (req, res) => {
    res.render("user/thanks")
}

const page404 = async (req, res) => {
    res.render("user/404")
}

const blog=async(req,res)=>{
    res.render("user/blog")
}

const Contact=async(req,res)=>{
    res.render("user/contact")
}







module.exports = {
    home,
    registrationForm,
    insertUser,
    otpPage,
    EnteredOTP,
    OtpMailSending,
    resendOtp,
    loginload,
    loginUser,
    Logout,
    forgetpw,
    getEmail,
    fpReset,

    miniCart,
    unifiedShop,
    // lowTohigh,
    // categoryWise,
    singleProduct,
    
    blog,
    page404,
    Contact,


    thanks

}