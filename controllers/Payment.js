const {instance}=require("../config/razorpay")
const User=require("../models/User")
const Course=require("../models/Course")

const mailSender=require("../utils/mailSender")
const { default: mongoose } = require("mongoose")


//cpature the payment and initiate the user
exports.capturePayment=async(req,res)=>{

         const {courseId}=req.body
         const {userId}=req.userId

         if(!courseId){
            return res.json({
                success:false,
                message:"please provide valid course id"
            })
         }
         // valid course detail
         let course
         try{
               course=await Course.findById(courseId)
               if(!course){
                return res.json({
                    success:false,
                    message:"course detail not found"
                })
               }

               // check if alreday is enrolled in this course or not
               const uid=new mongoose.Types.ObjectId(userId)
               if(course.studentsEnrolled.includes(uid)){
                return res.status(200).json({
                    success:false,
                    message:"student is alredy enrollled"
                })
               }
         }
         catch(error){
            console.log(error)
            return res.status(500).json({
                success:false,
                message:"error"
            })

         }
         
       // create the order
       const amount=course.price
       // currency
       const currency="INR"
       const options={
        amount:amount*100,
        currency,
        receipt:Math.random(Date.now()).toString(),
        notes:{
            courseId:courseId,
            userId
        }
       }
       try{ 
           // initiate the payment using razorpay
           const paymentResponse=await instance.orders.create(options)
           console.log("ye raha payment response--->>",paymentResponse)

           res.status(200).json({
            success:true,
            courseName:course.courseName,
            description:course.courseDescription,
            thumbnail:course.thumbnail,
            orderId:paymentResponse.id,
            currency:paymentResponse.currency,
            amount:paymentResponse.amount
            
           })

       }
       catch(error){
          console.log(error)
          res.json({
            success:false,
            message:"couldnt initiate the response"
          })
       }    

}
// verify the signature that is authorization

exports.verifySignature=async(req,res)=>{
    const webhook="123456"
    
    const signature=req.headers["x-razorpay-signature"]

    const shasum= crypto.createHmac("sha256",webhook);
    shasum.update(JSON.stringify(req.body));
    const digest=shasum.digest("hex");

    if(signature==digest){
        console.log("payment is authorized");

        const {courseId,userId}=req.body.payload.payment.entity.notes
        try{
             // perform the action 
             // find the course enrolled the student
             const enrolledCourse=await Course.findByIdAndUpdate({_id:courseId},
                {
                    $push:{enrolledStudent:userId}
                },
                {
                    new:true
                });
                if(!enrolledCourse){
                    return res.status(500).json({
                        success:false,
                        message:"course not found"
                    })
                }

                console.log(enrolledCourse)

                // find the student and add the course in list of enrolled course

                const enrolledStudent= await User.findByIdAndUpdate({_id:userId},
                    {
                        $push:{
                            courses:courseId
                        }
                    },
                    {
                        new:true
                    });

                    console.log(enrolledStudent)

                    // now we to send the mail

                    res.status(200).json({
                        success:true,
                        message:"student is enrolled in thr course"
                    })
        }
        catch(error){
           console.log(error)
           res.status(500).json({
            success:false,
            message:error.message
           })
        }
    }
    else{
        return res.status(400).json({
            success:false,
            message:"invalid request"
        })
    }
}