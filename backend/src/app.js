const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');
const musicRoutes = require('./routes/music.routes');
const path = require('path')
const app = express();
app.set('trust proxy', 1);

app.use((req,res,next)=>{
    const o = req.headers.origin;
    if(o && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o)){
        res.header('Access-Control-Allow-Origin',o);
        res.header('Access-Control-Allow-Credentials','true');
        res.header('Access-Control-Allow-Headers','Content-Type');
        res.header('Access-Control-Allow-Methods','GET,POST,OPTIONS');
        res.header('Vary','Origin');
    }
    if(req.method === 'OPTIONS') return res.sendStatus(204);
    next();
})

app.use(express.static(path.join(__dirname,'../../frontend')))

app.use(express.json())

app.use(cookieParser())

app.use('/api/auth',authRoutes)

app.use('/api/music',musicRoutes)


module.exports = app;