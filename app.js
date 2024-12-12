const express = require("express");
const app = express();
const userModel = require("./models/user");
const postModel = require("./models/post");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const path = require("path");
// const multer = require("multer");
const fs = require("fs");
const upload = require("./config/multerconfig");

app.set("view engine" , "ejs");
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")))

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, '/public/images/uploads')
//     },
//     filename: function (req, file, cb) {
//     //   const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
//     crypto.randomBytes(12, function (err , bytes){
//         const fn = bytes.toString("hex") + path.extname(file.originalname);
//         cb(null, fn);
//     })
      
//     }
//   })
  
//   const upload = multer({ storage: storage })


// const uploadDir = path.join(__dirname, 'public/images/uploads');
// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
// }

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, uploadDir);
//     },
//     filename: function (req, file, cb) {
//         crypto.randomBytes(12, function (err, bytes) {
//             if (err) return cb(err);
//             const fn = bytes.toString("hex") + path.extname(file.originalname);
//             cb(null, fn);
//         });
//     }
// });

// const upload = multer({ storage: storage });



app.get("/" , (req ,res)=>{
    res.render("index");
})

app.get("/profile/upload" , (req ,res)=>{
    res.render("profileupload");
})

app.post("/upload" , isLoggedIn , upload.single("image") ,async (req ,res)=>{
    // console.log(req.file);
    let user = await userModel.findOne({email: req.user.email});
    user.profilepic = req.file.filename;
    await user.save();
    res.redirect("/profile");
})

// app.get("/test" , (req ,res)=>{
//     res.render("test");
// })

// app.post("/test" , (req ,res)=>{
//     console.log(req.body);
// })

// app.post("/upload", upload.single("image") , (req ,res)=>{
//     console.log(req.file);
// })

// app.post("/upload", upload.single("image"), (req, res) => {
//     console.log(req.file);
//     res.send("File uploaded successfully");
// });

app.get("/login" , (req ,res)=>{
    res.render("login");
})

// we used isLoggedIn fucntion to make this route as a protected route 
app.get("/profile", isLoggedIn ,async (req,res)=>{

   

    let user = await userModel.findOne({email: req.user.email}).populate("posts");
    //  console.log(req.user);
    
    res.render("profile" , {user});
})


app.post("/post", isLoggedIn ,async (req,res)=>{

   

    let user = await userModel.findOne({email: req.user.email}); // from this line we got to know who is logged in 
    let {content} = req.body;
    let post = await postModel.create({
        user: user._id ,
        content:content 
    });

    user.posts.push(post._id);
    await user.save();
    res.redirect("/profile");
    //  console.log(req.user);
    // res.render("profile" , {user});
})

app.get("/logout" , (req,res)=>{
    res.cookie("token" , "");
    res.redirect("login");
})

app.post("/register" ,async (req ,res)=>{
    let{email ,password , username ,name ,age } =req.body;

    let user =await userModel.findOne({email});

    if(user)return res.status(500).send("user already registered");

    bcrypt.genSalt(10 , (err, salt)=>{
        bcrypt.hash(password , salt,async (err ,hash) =>{
            let user =await userModel.create({
                username,
                email,
                age,
                name,
                password: hash
            });

            let token = jwt.sign({email: email, userid: user._id}, "shhhh");
            res.cookie("token", token);
            res.send("registered");
        }) 
    })
})

app.post("/login" ,async (req ,res)=>{
    let{email ,password } =req.body;

    let user =await userModel.findOne({email});

    if(!user)return res.status(500).send("Something went wrong");

    bcrypt.compare(password , user.password , (err , result)=>{
        if(result){

         
         let token = jwt.sign({email: email, userid: user._id}, "shhhh");
         res.cookie("token", token);
        //  res.status(200).send("you can  login");
         res.status(200).redirect("/profile");
       } else res.redirect("/login");
    })
})

// we use this below mwthod to protect routes / for protected routes
function isLoggedIn(req,res ,next){
    // if(req.cookies.token === "") res.send("you must be logged in ");
    if(req.cookies.token === "") res.redirect("/login");
    else{
      let data =   jwt.verify(req.cookies.token, "shhhh");
      req.user= data;
    }
    next();
}

app.listen("3000" , ()=>{
    console.log("server is running on port 3000");
})


