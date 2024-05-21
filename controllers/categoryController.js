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
    const check = await Category.findOne({ CategoryName: { $regex: new RegExp('^' + newCategory + '$', 'i') } });
     if(!check){
    const addedCategory=new Category({
    CategoryName:newCategory,
    Description:description
    })
    const addCategory=await addedCategory.save()
    res.redirect('/admin/category')
}else{
    req.flash("err", "category already exists");
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
        if (categoryId.length === 24) {
        const checkCategory=await Category.findOne({_id:categoryId})
        if(checkCategory){
        checkCategory.is_blocked=!checkCategory.is_blocked
        checkCategory.save()
    }else{
        res.redirect('/admin/error')
    }
    }else{
        res.redirect('/admin/error')
}
    } catch (error) {
        console.log(error.message);
    }
}




//to edit category
const editCategory=async(req,res)=>{
    try {
        const msg=req.flash('msg')
        const CategoryId=req.params.id
        if (CategoryId.length === 24) {
        const category=await Category.findOne({_id:CategoryId})
        if(category){
            res.render('admin/editCategory',{category,msg})
        }else{
            res.redirect('/admin/error')
        }
    }else{
        res.redirect('/admin/error')
    }
    } catch (error) {
        console.log(error.message);
    }
}




//to get edited data in category page
const editedCategoryData=async(req,res)=>{
    try {
        const {CategoryName,description,id}=req.body
        const check=await Category.findOne({CategoryName: { $regex: new RegExp(CategoryName, "i")}})
        if (!check) {
            const edited=await Category.findByIdAndUpdate({_id:id},{
             CategoryName:CategoryName,
             Description:description
             },{new:true})
             if(edited){
                res.redirect('/admin/category')
            }
        }else{
            req.flash('msg','Category already exists')
            const already=await Category.findOne({_id:id})
            const msg=req.flash('msg')
            res.render('admin/editCategory',{category:already,msg})
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