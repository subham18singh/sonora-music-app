const jwt = require('jsonwebtoken');

async function authArtist(req,res,next){
    const token = req.cookies.token;

    if(!token){res.status(401).json({ message : "Unauthorized"})}

    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET)

        if(decoded.role !== "artist"){
            return res.status(403).json({message : "you dont have access"})
        }
        req.user = decoded;
        next()
    }
    catch(err){
        console.log(err);
        res.status(401).json({
            message : "Unauthorized token"
        })
    }
}

async function authUser(req,res,next){
    const token = req.cookies.token

    if(!token){
        res.status(403).json({
            message : "Unauthorized Token"
        })
    }

    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET)

        if(decoded.role !== "user" && decoded.role !== "artist"){
            return res.status(403).json({
                message : "Unauthorized Access"
            })
        }

        req.user = decoded

        next()
    }
    catch(err){
        console.log(err);
        res.status(403).json({
            message : "Unauthorized"
        })
    }
}

module.exports = {authArtist , authUser}