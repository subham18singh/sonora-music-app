const mongoose = require('mongoose');

async function connectDB(){
    try{
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("Connected to DB")
    }
    catch(error){
        console.error("Facing error while connedcting to databse : ", error)
    }

}

module.exports = connectDB