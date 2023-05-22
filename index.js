const mongoose = require("mongoose")
const express = require("express")
const UserModel = require("./models/userSchema")
const authGaurd  = require("./middleware/auth");
const bodyParser = require("body-parser");
const config = require("./config/config");
let bcrypt = require("bcrypt");
let cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express()
app.use(bodyParser.json());
app.use(cors());
const dbURL = "mongodb+srv://saumyarastogi1729:x9L3fv9O6kIXR4YQ@cluster0.b6g8l1g.mongodb.net/?retryWrites=true&w=majority"

const connectionParam = {
    useNewUrlParser : true,
    useUnifiedTopology : true
} 

mongoose.connect(dbURL, connectionParam)
.then(()=>{
  console.log("Connected to db")  
})
.catch((e)=>{
    console.log("Error:",e)
});

app.listen(3000, ()=>{
    console.log("Listening on port 3000")
})


app.post("/login",async (req,res) =>
{
    const user = await UserModel.findOne({email : req.body.email},{_id : 0 ,__v:0}).lean();

    if(user)
    {
       if(await bcrypt.compare(req.body.password,user.password))
       {
        let data = {
            userName : user.userName,
            role : user.role,
            email : user.email
        }
        let token = jwt.sign(data,config.jwtSecret);
        delete user.password;
        res.status(200).json({token:token,user:user});
       }else{
        res.status(401).send("invalid password");
    }

    }else{
        res.status(401).send("user not found");
    }
})

app.post("/registerNewUser", async (request, response)=>{
    //check if email already exist
    const emailExist = await UserModel.findOne({email : request.body.email},{_id : 0 ,__v:0})
    if(emailExist){
        response.status(400).send("Email already exist")
        return;
    }else{
        //if new user then first encrypt password first then save

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(request.body.password, salt);

        //after encrypting password save new user

        const user = new UserModel({
            userName : request.body.userName,
            role : request.body.role,
            contact : request.body.contact,
            isAdmin : request.body.isAdmin,
            email : request.body.email,
            password : hashPassword,
            skills : request.body.skills
        })

        try{
            const saveUser = await user.save();
            response.status(200).json( saveUser)
        }catch(error){
            console.log(error)
            response.status(500).send("Internal server error");
        }

    }
});

app.get("/currentUser",authGaurd(["admin","user"]) ,async (req, res) => {    
    try{
        const user = await UserModel.findOne({email : req.user.email},{_id : 0 ,__v:0 , password : 0}).lean();
        res.status(200).json(user);

    }catch(err){
        console.log("catch /getUserByEmail/:email",err)
        res.status(500).send(err);
        }
} )

app.get("/getUserByEmail/:email",authGaurd(["admin"]) , async (req, res) => {    
    try{
        const users = await UserModel.findOne({email : req.params["email"]},{_id : 0 ,__v:0 , password : 0}).lean();
        res.status(200).json(users);

    }catch(err){
        console.log("catch /getUserByEmail/:email",err)
        res.status(500).send(err);
        }
} )

app.get("/user/name",authGaurd(["admin","user"]) ,async (req, res) => {    
    try{
        const users = await UserModel.find({userName : req.user.userName},{_id : 0 ,__v:0 , password : 0}).lean();
        res.status(200).json(users);

    }catch(err){
        console.log("catch /user/name/",err)
        res.status(500).send(err);
        }
} )

app.get("/getAllUsers",authGaurd(["admin"]),async (req, res) => {    
    try{
        const users= await UserModel
        .find({},{_id : 0 ,__v:0 , password : 0}).lean();
        res.status(200).send(users);
    }catch(err){
        console.log(err)
        res.status(500).send(err);
        }
} )



app.post("/updateUser", authGaurd(["admin","user"]), async (req,res) =>{
    try{
        if((req.body.email != req.user.email)&&(req.user.role != "admin"))
        {

            console.log(req.body, req.user.email,req.user.role)
            res.status(500).send("HEHEH");
            return;
        }
        
        console.log(req.body, req.user.email,req.user.role)
        const filter = { email : req.body.email };
        const update  = { 
            "userName" : req.body.userName,
            "contact" : req.body.contact,
            "role" : req.body.role,
            "skills" : req.body.skills
         };
        await UserModel.updateOne(filter,update);
        let user = await UserModel.findOne(filter);
        res.status(200).send(user);
    }catch(err){
        console.log(err)
        res.status(500).send(err);
    }
})





