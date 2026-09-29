const mongoose = require('mongoose');

const musicSchema = new mongoose.Schema({
    uri :{
        type : String,
        required : true
    },
    title : {
        type : String,
        required : true
    },
    artist : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "musics",
        requried : true
    }
})

const musicModel = mongoose.model("music_store",musicSchema)

module.exports = musicModel