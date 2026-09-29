const musicModel = require('../models/music.model.js')
const albumModel = require('../models/album.model.js')
const { uploadMusic } = require('../services/storage.services.js')
const { fetchTracks } = require('../services/discover.services.js')
const jwt = require('jsonwebtoken')

async function createMusic(req,res){
    
    const { title } = req.body
    const file = req.file

    const result = await uploadMusic(file.buffer.toString('base64'))

    const music = await musicModel.create({
        uri : result.url,
        title,
        artist : req.user.id
    })

    res.status(201).json({
        message : "music created succesfully",
        music : {
            id : music.id,
            uri : music.uri,
            title : music.title,
            artist : music.artist,
        }
    })
}

async function createAlbum(req,res){
    const {title , music} = req.body

    const album = await albumModel.create({
        title,
        artist : req.user.id,
        musics : music,
    })

    res.status(201).json({
        message : "Album created successfully",
        album : {
            id : album._id,
            artist : album.artist,
            title : album.artist,
            music : album.musics
        }
    })
}

async function getAllMusic(req,res){
    const allMusic = await musicModel.find().skip(0).limit(10).populate("artist","userName email")

    res.status(201).json({
        message : "Music fetched successfully",
        musics : allMusic
    })
}

async function getallAlbums(req,res){
    const allAlbums = await albumModel.find().select("title artist").populate("artist","userName email")

    res.status(201).json({
        message : "Fetched all Albums",
        albums : allAlbums
    })
}

async function getAlbumId(req,res){
    const albumId = req.params.albumId;

    const album = await albumModel.findById(albumId).populate("artist" , "userName email").populate("musics" , "uri title")

    res.status(200).json({
        message : "Album fetched successfully",
        album : album
    })

}

async function discoverMusic(req,res){
    try{
        const tracks = await fetchTracks({
            q : (req.query.q || '').toString().trim().slice(0,80),
            tag : (req.query.tag || '').toString().trim().slice(0,40),
            page : Math.max(1, parseInt(req.query.page) || 1)
        })
        res.status(200).json({ message : "Discover music fetched", musics : tracks })
    }catch(err){
        console.log(err)
        res.status(err.status || 500).json({ message : err.message || "Could not fetch music" })
    }
}

module.exports = {createMusic , createAlbum , getAllMusic , getallAlbums , getAlbumId , discoverMusic}