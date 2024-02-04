const port=4000;
const express =require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path= require("path");
const cors = require("cors");
const { log } = require("console");


app.use(express.json()); // request from responce is automatically passed through json
app.use(cors());  //reactjs is connected to express app through 4000 port

//initialize the database 
//Database connection with mongodb
mongoose.connect("mongodb+srv://maheedharkosana:15398076y@cluster0.azjhaus.mongodb.net/ecommerce")

//API creation

app.get("/",(req,res)=>{
    res.send("Express App is Running")
})

//image storage engine
const storage=multer.diskStorage({
    destination: './upload/images',
    filename : (req,file,cb)=>{
        return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

//create a upload function and pass  the above configuration using multer
const upload = multer({storage:storage})
//creating upload end point for images
app.use('/images',express.static('upload/images'))

app.post("/upload",upload.single('product'),(req,res)=>{
    res.json({
        success: 1 ,
        //new image url creation
        image_url:`http://localhost:${port}/images/${req.file.filename}` 
    })
})



//whenever we upload an object in mongo db, we have to create a schema using mongoose library
//schema for creating products
const Product = mongoose.model("product",{
    //define product model
    id:{
        type: Number,
        required:true,

    },
    name:{
        type:String,
        required:true,
    },
    image:{type:String,
        required:true,
    },
    category: {
        type: String,
        required:true,
    },
    new_price: {
        type: Number,
        required:true,
    },
    old_price: {
        type: Number,
        required:true,
    },
    date:{
        type:Date,
        default: Date.now,
    },
    available:{
        type:Boolean,
        default:true,
    }

})

//creating an endpoint from which we can upload our product to database
app.post('/addproduct',async(req,res)=>{
    let products = await Product.find();
    let id;
    if(products.length>0){
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id =last_product.id+1;
    }
    else{
        id=1;
    }
    const product = new Product({
        id:id,
        name: req.body.name,
        image:req.body.image,
        category:req.body.category,
        new_price:req.body.new_price,
        old_price : req.body.old_price,
    });
    console.log(product);
    //saving this product in database
    await product.save();
    console.log("Saved");
    res.json({
        success:true,
        name:req.body.name,
    })
})

//creating API for deleting products
app.post('/removeproduct',async(req, res)=>{
    //method find 1 and delete
    await Product.findOneAndDelete({id:req.body.id});
    console.log("Removed");
    res.json({
        success:true,
        name:req.body.name
    })
})

//creating API for getting all products
app.get('/allproducts',async(req, res)=>{
    //we will save all products in one array
    let products = await Product.find({});
    console.log("All Products Fetched")
    res.send(products);
})

//Schema creating for user model
const Users = mongoose.model('Users',{
    name:{
        type: String,
    },
    email:{
        type:String,
        unique: true,
    },
    password:{
        type:String,
    },
    cartData:{
        type:Object,
    },
    date:{
        type:Date,
        default:Date.now,
    }
})

//creating endpoint for registring the user
app.post('/signup',async(req,res)=>{
    let check = await Users.findOne({email:req.body.email});
    if(check){
        return res.status(400).json({success:false,error:"Existing User Found with same Email Id"});
    }
    let cart = {};
    for(let i=0;i<300;i++){
        cart[i]=0;
    }
    const user =new Users({
        name:req.body.username,
        email:req.body.email,
        password:req.body.password,
        cartData:cart,
    })
    await user.save();
    const data = {
        user:{
            id:user.id
        }
    }
    const token = jwt.sign(data,'secret_ecom');
    res.json({success:true,token});
})

//creating endpoint for user login

app.post('/login',async(req,res)=>{
    let user =await Users.findOne({email:req.body.email});
    if(user){
        const passCompare = req.body.password ===user.password;
        if(passCompare){
            const data ={
                user:{
                    id:user.id
                }
            }
            const token =jwt.sign(data,'secret_ecom');
            res.json({success:true,token});
        }
        else{
            res.json({success:false,errors:"Wrong Password"});
        }
    }
    else{
        res.json({success:false,errors:"Wrong Email Id"})
    }
})

//creating endpoint for new collection data
app.get('/newcollections',async(req,res)=>{
    let products=await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    console.log("NewCollection Fetched");
    res.send(newcollection);
})

//creating an endpoint for popular in women section
app.get('/popularinwomen',async(req,res)=>{
    let products = await Product.find({category:"women"});
    let popular_in_women = products.slice(0,4);
    console.log("Popular in women Fetched");
    res.send(popular_in_women);
})
//creating middleware to fetch user
const fetchUser = async (req,res,next)=>{
    const token = req.header('auth-token');
    if(!token){
        res.status(401).send({errors:"Please authenicate using valid token"})
    }
    else{
        try{
            const data =jwt.verify(token,'secret_ecom');
            req.user = data.user;
            next();
        }catch(error){
            res.status(401).send({errors:"Please authenticate using a valid token"});
        }
    }
}

//creating endpoint for storing cart data 
app.post('/addtocart',fetchUser,async(req,res)=>{
    console.log("added",req.body.itemId);
    let userData =await Users.findOne({_id:req.user.id});
    userData.cartData[req.body.itemId]+=1;
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
    res.send("Added")

})

//creating endpoint to remove product from cart
app.post('/removefromcart',fetchUser,async(req,res)=>{
    console.log("removed",req.body.itemId);
    let userData =await Users.findOne({_id:req.user.id});
    if(userData.cartData[req.body.itemId]>0)
    userData.cartData[req.body.itemId]-=1;
    await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
    res.send("Removed")
})

//creating endpoint to get cart data
app.post('/getcart',fetchUser,async(req,res)=>{
    console.log("GetCart");
    let userData = await Users.findOne({_id:req.user.id});
    res.json(userData.cartData);
})
app.listen(port,(error)=>{
    if(!error){
        console.log("Server Running on port"+port)
    }
    else{
        console.log("Error : "+error)
    }
})
