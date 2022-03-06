const express = require('express');
const req = require('express/lib/request');
const app = express();
const hbs = require('hbs');
const async = require('hbs/lib/async');
const path = require('path');
const mongoose = require('./db/conn');
const userModel = require('./models/userSchema');
const bodyParser = require('body-parser');
const { enable } = require('express/lib/application');
const { use } = require('express/lib/router');
const brcrypt = require('bcryptjs');
const bcrypt = require('bcryptjs/dist/bcrypt');
const port = process.env.PORT || 3000;

//use to parse request data on each request
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const view_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.set('view engine', 'hbs');
app.set('views', view_path);
hbs.registerPartials(partials_path);

app.get('/', (req, res)=>{
    res.send("Assignment on NodeJS, Express and MongoDB");
});

app.get('/login', (req, res)=>{
    res.render('index', { login_status: ""});
});

app.post('/login', async (req, res)=>{
    try{
        let userEmail = req.body.email;
        let pass = req.body.password;
        if(userEmail.length !== 0 && pass.length !== 0){
            const getUser = await userModel.findOne({ email: userEmail });
            
            const checkWithHashPass = await brcrypt.compare(pass, getUser.password); 
            
            if(checkWithHashPass){
                const token = await getUser.generateAuthToken();
                console.log("Token From Login: "+token);
                res.render('dashboard', { user: getUser.username });
            }else{
                res.render('index', { login_status: "Invalid Login Credencials" , textColor: "text-danger"});
            }
        }else{
            res.render('index', { login_status: "Please fill all details" , textColor: "text-danger"});
        }
    }catch(err){
        res.render('index', { login_status: "Invalid Login Credencials", textColor: "text-danger" });
    }
});

app.get('/register', (req, res)=>{
    res.render('register');
});

app.post('/register', async (req, res)=>{
    try{
        let user = req.body.username;
        let email = req.body.email;
        let pass = req.body.password;
        let conPass = req.body.confrimPassword;
        // console.log(user+" "+email+" "+pass+" "+conPass);

        if(user.length !==0 && email.length !==0 && pass.length !==0 && conPass.length !==0){
            const checkEmailExists = await userModel.findOne({ email: email});
            if(!checkEmailExists){
                if(pass === conPass){

                    //Instead of these called middleware using pre() in ./models/userSchema file to hash pass before saving it into DB
                    // const hashPass = await securePassword(pass);
                    // console.log("From Register: "+ hashPass);

                    const userRegister = new userModel({
                        username: req.body.username,
                        email: req.body.email,
                        password: pass
                    })

                    const saveResult = await userRegister.save();
                    res.status(201).render('index');
                }else{
                    // res.send("Password are not matching.");
                    res.render('register', { register_status: "Password are not matching" , textColor: "text-danger"});
                }
            }else{
                res.render('register', { register_status: "Email already registed" , textColor: "text-danger"});
            }
        }else{
            res.render('register', { register_status: "Please fill all details" , textColor: "text-danger"});
        }
    }catch(err){
        res.status(400).send(err);
        console.log(err);
    }
});

const securePassword = async (password) =>{
    return await bcrypt.hash(password, 10);   
}

app.listen(port, ()=>{
    console.log(`server is running at port ${port}...`);
});