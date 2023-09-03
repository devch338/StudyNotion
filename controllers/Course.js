const Course=require("../models/Course")
const Category=require("../models/Category")
const User=require("../models/User")
const {uploadImageToCloudinary}=require("../utils/ImageUploader")
require("dotenv").config()
const Subsection=require("../models/SubSection")
exports.createCourse=async(req,res)=>{
    try{
          const{courseName,
            courseDescription,
            whatYouWillLearn,
            price,
            category,
           // status,
           // tag:_tag,
           // instructions:_instructions
            }=req.body

          const thumbnail=req.files.thumbnailImage

          console.log("body me se details--->>>",courseName,
          courseDescription,
          whatYouWillLearn,
          price,
          category)

              // Convert the tag and instructions from stringified Array to Array
               // const tag = JSON.parse(_tag)
                //const instructions = JSON.parse(_instructions)
   


          // validation
          if(!courseName||!courseDescription||!whatYouWillLearn||!price||!category||!thumbnail
       //     ||!tag.length//||!instructions.length
            ){
            return res.status(400).json({
                success:false,
                message:"enter all fields carefullly"
            })
          }


          //if (!status || status === undefined) {
            //status = "Draft"
          //}


          // db call for instructor  to store the object id in course schema\

         const userId=req.user.id;
         // const instructorDetails=await User.findById(userId,{accountType:"Instructor"})
         // console.log("instructors details---->>",instructorDetails)

         const instructorDetails=await User.findById(userId,{accountType:"Instructor"})


         console.log("instructor ki details---->>",instructorDetails)

        

          if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:"instructor details not found"
            })
          }
             
          // check for category validation in db
          const categoryDetails=await Category.findById(category)

          console.log("category ki details--->>",categoryDetails)
          if(!categoryDetails){
            res.status(404).json({
                success:false,
                message:"category deatils not found in db"
            })
          }
          // upload image to cloudianry
          const thumbnailImage=await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME)

          console.log("hello jiiii--->>>>>")
           
          // create an enrtry for new course
          const newCourse=await Course.create({
            courseName,
            courseDescription,
            instructor:instructorDetails._id,
            whatYouWillLearn:whatYouWillLearn,
            price,
           // tag,
            category:categoryDetails._id,
            thumbnail:thumbnailImage.secure_url,
            //status,
           /*instructions*/
          })

          console.log("hiiii hello from my side->>>>>")

          // update instructor user to update in the course list
          await User.findByIdAndUpdate(
            {_id:instructorDetails._id},
            {
                $push:{courses:newCourse._id}
            },
            {new:true}
            )

            console.log("yaha tak chal raha ha9>>>>>>>")
            
            // update the Cateegory  schema in home work

            await Category.findByIdAndUpdate(
                {_id:categoryDetails._id},
                {
                    $push:{course:newCourse._id}
                },
                {new:true}
            )
            console.log("status se upr tak hai ye ")
            return res.status(200).json({
                success:true,
                message:"course creaed successfully",
                data:newCourse
            })
    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            message:"course creation is failed",
            error:error.message
        })

    }
}

// get all courses

exports.getAllCourse=async(req,res)=>{
    try{
     const allCourse=await Course.find({status:"Published"},
                                            {
                                                courseName:true,
                                                price:true,
                                                thumbnail:true,
                                                instructor:true,
                                                ratingAndReviews:true,
                                                studentsEnrolled:true
                                            }).populate("instructor").exec();
        
        res.status(200).json({
            success:true,
            message:"all couses data",
            data:allCourse
        })
    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            success:false,
            message:" get alll course  is failed"
        })
    }
}

// get deatails of one courses
exports.getFullCourseDetails=async(req,res)=>{
    try{
         // get course id 
         const {courseId}=req.body
         // find details of course

         const courseDetails=await Course.find({_id:courseId}).populate(
            {
                path:"instructor",populate:{path:"additionalDetails"},
            }
         ).populate("category")
         //.populate("ratingAndReviews")
         .populate({
            path:"courseContent",
            populate:{
                path:"subSection"
            }
         }).exec();

         if(!courseDetails){
            return res.status(400).json({
                success:false,
                message:"couldnot find the course details"
            })
         }

       /*  let totalDurationInSeconds = 0
        courseDetails.courseContent.forEach((content) => {
         content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration)
        totalDurationInSeconds += timeDurationInSeconds
      })
    })

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)*/

         return res.status(200).json({
            success:true,
            message:"course details succesfully",
            courseDetails
           // totalDuration
         })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:" get  details alll course  is failed",
            error:error.message
        })
    }
}