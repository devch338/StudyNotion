const mongoose=require("mongoose")
require("dotenv").config()

exports.connect=()=>{
    mongoose.connect(process.env.URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true
    })
    .then(()=>console.log("connnection successfull"))
    .catch((error)=>{
        console.log("failed")
        console.error(error)
         process.exit(1)
    })

}