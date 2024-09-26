//imports

require('dotenv').config();
const express = require('express');
const mongoose  = require('mongoose');
const session = require('express-session');
// const { default: mongoose } = require('mongoose');

const app  = express()
const PORT = process.env.PORT || 4000 ;

//database connection 

mongoose.connect(process.env.DB_URI, {useNewUrlParser: true , useUnifiedTopology:true})
const db = mongoose.connection;
db.on("error",((error)=>console.log(error)))
db.once("open", ()=> console.log("connected to the database !"))




// middlewares 
app.use(express.urlencoded({extended:false}))
app.use(express.json())


app.use(session({
    secret: "xG6hG0ZK0XCAbLfM",
    saveUninitialized:true,
    resave:false
}
    
));
app.use(express.static("uploads"));

app.use((req, res, next)=>{
    res.locals.message = req.session.message;
    delete req.session.message;
    next()

})


//set template engine

app.set("view engine", "ejs");


// app.get("/" , (req , res) => {
//     res.send('Hello world')  // ecrit sur toute la page
// })



// route prefix 

app.use("",require("./routes/routes"))


app.listen(PORT , ()=>{
    console.log( `Server started at http://locahost:${PORT}`);
})

