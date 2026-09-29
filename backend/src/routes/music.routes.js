const express = require('express');
const multer = require('multer')
const musicController = require('../controllers/music.controller')
const authMiddleware = require('../middlewares/auth.middleware.js')

const router = express.Router();

const upload = multer({
    storage : multer.memoryStorage()
})

router.post('/upload',authMiddleware.authArtist,upload.single("music"),musicController.createMusic)

router.post('/album',authMiddleware.authArtist,musicController.createAlbum)

router.get('/',authMiddleware.authUser, musicController.getAllMusic)

router.get('/albums',authMiddleware.authUser, musicController.getallAlbums)

router.get('/albums/:albumId' , authMiddleware.authUser , musicController.getAlbumId)

router.get('/discover', authMiddleware.authUser, musicController.discoverMusic)

module.exports = router