const mongoose=require("mongoose")
const mailSender=require("../utils/mailSender")
const emailTemplate=require("../mail/emailVerfication")

const OTPSchema=new mongoose.Schema({
    email:{
        type:String,
       // required:true
    },
    otp:{
        type:String,
        //required:true
    }
 //   createdAt:{
       /// type:Date,
       /// default:Date.now(),
       //expires:5*60
    //}
})

async function sendVerificationEmail(email,otp){
    try{

       // mail sender is already in utils folder 
           const mailresponse = await mailSender(email,"Verification email from StudyNotion",emailTemplate(otp))
           console.log("email send successfuly",mailresponse)
    }
    catch(error){
       console.log("error occured while sending mail",error)
       throw error
    }
}

OTPSchema.pre("save",async function(next){
    // when only new document is created 
    if(this.isNew){
    await sendVerificationEmail(this.email,this.otp);
    }
    next(); 
})

module.exports=mongoose.model("Newotp",OTPSchema)