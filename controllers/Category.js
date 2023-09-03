const Category=require("../models/Category")
const { findById } = require("../models/Profile")

exports.createCategory=async(req,res)=>{
    try{
         
        const{name,description}=req.body

        if(!name||!description){
            return res.staus(400).json({
                success:false,
                message:"enter name and des carefully "
            })
        }
        // create entry in db
        const categoryDetails=await Category.create({
            name:name,
            description:description})

            console.log("category details--->>",categoryDetails)

            res.status(200).json({
                success:true,
                message:"category created successfullly",
                categoryDetails
            })
    }
    catch(error){
         return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

// get all category 

exports.showAllCategory=async(req,res)=>{
    try{
       
        const getAllCategory=await Category.find({},{name:true,description:true})

        if(!getAllCategory){
            return res.status(500).json({
                success:false,
                message:"Something went wrong while fetching all categories",
            })
        };

        if(getAllCategory.length === 0){
            return res.status(400).json({
                success:false,
                message:"No categories found",
            })
        };

        res.status(200).json({
            success:true,
            message:" all category deatils get successfullly",
            getAllCategory
        })
    }
    catch(error){
         return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

// category page details 

exports.categoryPageDetails=async(req,res)=>{
    try{
         // get category id
         const {CategoryId}=req.body

         // get the courses for above id 
         const selectedCategory=await Category.findById(CategoryId).populate("course").exec();
          if(!selectedCategory){
            return res.status(400).json({
                success:true,
                message:"data not found"
            })
         }
         
         // if category not found the shoe others 
         const differentCategory=await findById({_id:{$ne:CategoryId}}).populate("course").exec();
         // get top selling course 
         return res.status(200).json({
            success:true,
            data:{
                selectedCategory,
                differentCategory
            }
         })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}