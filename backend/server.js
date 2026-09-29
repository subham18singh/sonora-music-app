require('dotenv').config();

const dns = require('dns');
dns.setServers(['8.8.8.8','8.8.4.4']);

const app = require('./src/app')
const connectDB = require('./src/db/db')


connectDB();

const PORT = process.env.PORT || 3000

app.listen(PORT,()=>{
    console.log("server is running at port " + PORT);
})