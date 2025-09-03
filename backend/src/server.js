require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');

connectDB();
const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use(helmet())

app.use('/api/auth',require('./routes/auth.routes'));
app.use('/api/slang',require('./routes/slang.routes'));

app.get('/',(req,res)=>res.send("SlangoPedia is UP🚀"));

app.use(require('./middleware/errorHandler'));
const PORT  = process.env.PORT;
app.listen(PORT,()=>{
    console.log(`Server Running on PORT ${PORT}`)
})