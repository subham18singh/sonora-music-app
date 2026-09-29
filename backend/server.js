require('dotenv').config();

const dns = require('dns');
dns.setServers(['8.8.8.8','8.8.4.4']);

const app = require('./src/app')
const connectDB = require('./src/db/db')


connectDB();

app.listen(3000,()=>{
    console.log("server is running at port 3000");
})

