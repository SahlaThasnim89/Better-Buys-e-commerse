const Category=require("../model/CategoryModel")
const Offer=require("../model/offerModel")


//to get category page
const category=async(req,res)=>{
    try {
        const limit=4
        const page=Number(req.query.page)||1;
        const skip=(page-1)*limit;

        const count=await Category.countDocuments()
        const pages=Math.ceil(count/limit)
        const category=await Category.find().skip(skip).limit(limit)
        const offers=await Offer.find()
        res.render('admin/categoryManage',{category,offers,pages,
            currentPage:page,})   
    } catch (error) {
        console.log(error.message);
    }
    
 }


 //to add category
const addCategory=async(req,res)=>{
    const msg=req.flash('err')
    res.render('admin/addCategory',{msg})
}



//to get added category data
const addCategoryData=async(req,res)=>{
try {
    const{newCategory,description}=req.body
    const find=await Category.findOne({CategoryName:newCategory})
    if(!find){
        const check = await Category.findOne({ CategoryName: { $regex: new RegExp('^' + newCategory + '$', 'i') } });
        if(!check){
    const addedCategory=new Category({
    CategoryName:newCategory,
    Description:description
    })
    const addCategory=await addedCategory.save()
    res.redirect('/admin/category')
}else{
    const errormsg = "category already exists";
    req.flash("err", errormsg);
    res.redirect('/admin/addcategory')
}
}else{
    const errormsg = "category already exists";
    req.flash("err", errormsg);
    res.redirect('/admin/addcategory')
}

} catch (error) {
        console.log(error.message);
}
}



//to block category
const blockCategory=async(req,res)=>{
    try {
        const categoryId=req.body.id
        const checkCategory=await Category.findOne({_id:categoryId})
        checkCategory.is_blocked=!checkCategory.is_blocked
        checkCategory.save()
    } catch (error) {
        console.log(error.message);
    }
}




//to edit category
const editCategory=async(req,res)=>{
    try {
        const CategoryId=req.params.id
        const category=await Category.findOne({_id:CategoryId})
        res.render('admin/editCategory',{category})
    } catch (error) {
        console.log(error.message);
    }
}




//to get edited data in category page
const editedCategoryData=async(req,res)=>{
    try {
        const CategoryId=req.params.id
        const {CategoryName,description}=req.body
        const check=await Category.findOne({CategoryName: { $regex: new RegExp(CategoryName, "i")}})
        if (!check) {
            const edited=await Category.findByIdAndUpdate({_id:CategoryId},{
             CategoryName:CategoryName,
             Description:description
             },{new:true})
             if(edited){
                res.redirect('/admin/category')
            }
        }else{
            req.flash('msg','Category already exists')
            const already=await Category.findOne({_id:CategoryId})
            const msg=req.flash('msg')
            res.render('admin/editCategory',{msg, category:already})
        }
    } catch (error) {
        console.log(error.message);
    }
  
}




//to delete category from the list
const deleteCategory=async(req,res)=>{
    try {
        const categoryId=req.params.id
        const toDelete=await Category.deleteOne({_id:categoryId})
        res.redirect('/admin/category')
    } catch (error) {
        console.log(error.message);
    }
    
}


module.exports={
    category,
    addCategory,
    addCategoryData,
    blockCategory,
    editCategory,
    editedCategoryData,
    deleteCategory
}