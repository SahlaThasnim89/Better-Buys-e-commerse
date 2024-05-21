const User = require('../model/userModel')
const Coupen = require('../model/coupenModel')
const { name } = require('ejs');


//admin side
const coupen = async (req, res) => {
    try {
        const limit = 3
        const page = Number(req.query.page) || 1;
        const skip = (page - 1) * limit;

        const count = await Coupen.countDocuments()
        const pages = Math.ceil(count / limit)
        const coupen = await Coupen.find()
        res.render('admin/coupenPage', {
            coupen, pages,
            currentPage: page,
        })
    } catch (error) {
        console.log(error.message);
    }
}

const addCoupen = async (req, res) => {
    try {
        res.render('admin/addCoupen')
    } catch (error) {
        console.log(error.message);
    }
}


const generatecode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '#';
    for (let i = 0; i < 11; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        code += characters.charAt(randomIndex);
    }
    return code;
};


const coupenAdding = async (req, res) => {
    try {
        const images = req.file.filename
        const { name, valid, minimum, maximum, offer, description, minBuy, maxBuy } = req.body
        const currentDate = new Date();
        const expiryDate = new Date(currentDate);
        expiryDate.setDate(currentDate.getDate() + parseInt(valid));
        const user = req.session.user;
        const Add = new Coupen({
            name: name,
            validity: valid,
            offer: offer,
            minPurchase: minBuy,
            maxPurchase: maxBuy,
            minLimit: minimum,
            maxLimit: maximum,
            description: description,
            Image: images,
            coupenCode: generatecode(),
            expiryDate: expiryDate
        })
        const newCoupen = await Add.save()
        res.redirect('/admin/Coupen')
    } catch (error) {
        console.log(error.message);
    }
}

const editPage = async (req, res) => {
    try {
        const id = req.params.id
        if (id.length === 24) {
            const offer = await Coupen.findOne({ _id: id })
            if (offer) {
                const toEdit = await Coupen.findOne({ _id: id })
                res.render('admin/editCoupen', { edit: toEdit })
            } else {
                res.redirect('/admin/error')
            }
        } else {
            res.redirect('/admin/error')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const CoupenEditing = async (req, res) => {
    try {
        const { name, valid, minimum, maximum, offer, description, minBuy, maxBuy, id } = req.body
        const edit = await Coupen.findOneAndUpdate({ _id: id }, {
            $set: {
                name: name,
                validity: valid,
                offer: offer,
                minPurchase: minBuy,
                maxPurchase: maxBuy,
                minLimit: minimum,
                maxLimit: maximum,
                description: description,
            }
        })
        res.redirect('/admin/Coupen')
    } catch (error) {
        console.log(error.message);
    }
}




module.exports = {
    coupen,
    addCoupen,
    coupenAdding,
    editPage,
    CoupenEditing


}