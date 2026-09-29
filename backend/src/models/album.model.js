const mongoose = require('mongoose');

const albumSchema = mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    musics : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "music_store"
    }],
    artist : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "musics",
        required : true
    }
})

const albumModel = mongoose.model("album",albumSchema)


module.exports = albumModel