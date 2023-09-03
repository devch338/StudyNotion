const Subsection=require("../models/SubSection")
const Section=require("../models/Section")
const { uploadImageToCloudinary } = require("../utils/ImageUploader")
require("dotenv").config()

exports.createSubsection=async(req,res)=>{
    try{
       // fetch data from req body
       const{sectionId,title,timeDuration,description}=req.body
       // extarct video files 
       const video=req.files.video
       // validation
       if(!sectionId||!title||!timeDuration||!description){
        return res.status(400).json({
            success:false,
            message:"all fields are required"
        })
       }
       // upload video to cloudinary

       const uploadDetails=await uploadImageToCloudinary(video,process.env.FOLDER_NAME)

       // create s subsection

       const newsubsection=await Subsection.create({
        title:title,
        timeDuration:timeDuration,
        description:description,
        videoUrl:uploadDetails.secure_url
       })

       // update this in subsection
       const updateSection=await Section.findByIdAndUpdate(
        {_id:sectionId},
        {
            // check why not auto suggested
            $push:{subSection:newsubsection._id}
        },
        {
            new:true
        }
        )

        return res.status(200).json({
            success:true,
            message:"sunsection created succesfully",
            updateSection
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"section is not created  failed"
           })
    }
}

// hw updatesubsection

// delete subsection 