const mongoose  = require('mongoose')


const userSchema = mongoose.Schema({
    userName : {
        type : String,
        required : true,
        unique : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String, 
        required : true,
    },
    role :{
        type : String,
        enum : ["user","artist"],
        default : "user"
    }
})

const userModel = mongoose.model("musics",userSchema)

module.exports = userModel