const { ImageKit } = require('@imagekit/nodejs')

const client = new ImageKit({
    privateKey : process.env.IMAGEKIT_PRIVATE_KEY
})

async function uploadMusic(file){
    const result = await client.files.upload({
        file,
        fileName : "music_" + Date.now(),
        folder : "yt-complete-backend/music"
    })

    return result;
}

module.exports = { uploadMusic }