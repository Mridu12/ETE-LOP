const mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/Leacture17");

const userSchema = mongoose.Schema({
    username: "String",
    name: "String",
    age: "number",
    email: "String",
    password: "String",
    profilepic: {
        type:String ,
        default: "default.jpg"
    },
    posts:[ {   type:mongoose.Schema.ObjectId, ref:"post" } ]
})

module.exports = mongoose.model('user' , userSchema);