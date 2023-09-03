const express=require("express")
const app=express();
 

const userRoutes=require("./routes/User")
const courseRoutes=require("./routes/Course")
const profileRoutes=require("./routes/Profile")
const paymentRoutes=require("./routes/Payment")

const database=require("./config/database")
const cookieParser=require("cookie-parser")
const cors=require("cors")
const {cloudinaryConnect}=require("./config/cloudinary")
const fileUpload=require("express-fileupload")
const dotenv=require("dotenv");

dotenv.config();
const PORT=process.env.PORT||4000

// database connect
database.connect();

///middlware 
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin:"http://localhost:3000",
    credentials:true
}))

app.use(fileUpload({
    useTempFiles:true,
    tempFileDir:"/tmp"
}))

// cloudinary connections
cloudinaryConnect();

app.use(
    express.urlencoded({ extended: true })
);

// routes handles
app.use("/api/v1/auth",userRoutes)
app.use("/api/v1/profile",profileRoutes)
//app.use("/api/v1/payment",paymentRoutes)
app.use("/api/v1/course",courseRoutes)

// def route

app.get("/",(req,res)=>{
    return res.json({
        success:true,
        message:"your server is running"
    })
})

app.listen(PORT,()=>{
    console.log("App is runnning at",PORT)
})