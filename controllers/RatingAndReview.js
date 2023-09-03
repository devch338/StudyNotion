const RatingAndReview=require("../models/RatingAndReview")
const Course=require("../models/Course")
const { default: mongoose } = require("mongoose")



exports.createRating=async(req,res)=>{
    try{
         // get user id 
         const userId=req.user.id
         // fetch data
         const{rating ,review,courseId}=req.body
         // ye user course me enrollled hai ya nai paisa diya hai nai 
      
         const courseDetails=await Course.findOne({_id:courseId,
         studentsEnrolled:{$elemMatch:{$eq:userId}}
        })
          

           if(!courseDetails){
            return res.status(404).json({
                success:false,
                message:"student is not enrolled in the course"
            })
           }

            //aur kya pata pehle se review se raha ho check in rating review in collection 
            const alredayRevewd=await RatingAndReview.findOne({user:userId,
                course:courseId
            })
            if(alredayRevewd){
                return res.status(404).json({
                    success:false,
                    message:"course is alreday reviwed"
                })
            }

            // crete the rating
            const ratingReview=await RatingAndReview.create({rating,review,course:courseId,user:userId})
             // update this rating in the course
           const updatedCourseDetails=  await Course.findByIdAndUpdate({_id:courseId},{
                $push:{
                    ratingAndReviews:ratingReview._id
                }
             },
             {
                new:true
             })
             console.log("updatedcoursedetails in rating---->>>",updatedCourseDetails)

             return res.status(200).json({
                success:true,
                message:"rating created success",
                ratingReview
             })

    }
    catch(error){
        console.log(error)
        res.status(500).json({
            success:true,
            message:"error in rating and review "
        })

    }
}
/// get average rating   

exports.getAverageRating=async(req,res)=>{
    try{
         const courseId=req.body.courseId
         // calculate the average rating 

         const result =await RatingAndReview.aggregate([
            {
                $match:{
                    course:new mongoose.Types.ObjectId(courseId)
                }
            },
            {
                $group:{
                    _id:null,
                    averageRating:{$avg:"$rating"}
                }
            }
         ])
         if(result.length>0){
            return res.status(200).json({
                success:true,
                averageRating:result[0].averageRating
            })
         }
         // if no rating existed 
         else{
         return res.status(200).json({
            success:true,
            message:" average rating is zero ",
            averageRating:0
         })
        }
    }
    catch(error){
        console.log(error)
        res.status(500).json({
            success:true,
            message:"error in  gettting average rating and review "
        })

    }
}
// exports get all rating 
exports.getAllRating=async(req,res)=>{
    try{
        const allreview=await RatingAndReview.find({})
                                                    .sort({rating:"desc"})
                                                    .populate({
                                                        path:"user",
                                                        select:"firstName lastName email image"
                                                    })
                                                    .populate({
                                                        path:"course",
                                                        select:"courseName"
                                                    })
                                                    .exec();
        return res.status(200).json({
            success:true,
            message:" all rating are here",
            allreview
        })


    }
    catch(error){
        res.status(500).json({
            success:true,
            message:"eroor in getting all rating "
        })
    }
}