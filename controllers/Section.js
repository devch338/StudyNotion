const Section=require("../models/Section")
const Course=require("../models/Course")

exports.createSection=async(req,res)=>{
    try{
       // data fetch

       const{sectionName,courseId}=req.body
       // validation

       if(!sectionName||!courseId){
        return res.status(400).json({
            success:false,
            message:"name and are not found"
        })
       }

       // create section

       const newSection=await Section.create({sectionName})

       // update course with section id 
       //TODO how to use poplulate

       const updatedCourseDetails=await Course.findByIdAndUpdate(
        courseId,
        {
            $push:{
                courseContent:newSection._id
            }
        },
        {new:true}
        )

        // return response

      return  res.status(200).json({
        success:true,
        message:"section ceated successfully",
        updatedCourseDetails
      })
    }

    catch(error){
       return res.status(500).json({
        success:false,
        message:"section is not created failed"
       })
    }
}

exports.updateSection=async(req,res)=>{
    try{
        // data of created section
        const{sectionName,sectionId}=req.body
        // validation
        if(!sectionName||!sectionId){
            return res.status(400).json({
                success:false,
                message:"name and  id are not found"
            })
        }

        const section= await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true})

        return res.status(200).json({
            success:true,
            message:"section updated successfullly",
            section
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"section is not updated failed",
            error:error.message
           })
    }
}

// use params as send id 
exports.deleteSection=async(req,res)=>{
    try{
        const{sectionId}=req.params

        await Section.findByIdAndDelete({sectionId})
        // is section ki id course ke schema me padi hogi 

        //TODO do we need to delete the entry form course schema

        res.status(200).json({
            success:true,
            message:" section deleted succesfuully"
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"section is not deleted failed"
           })
    }
}