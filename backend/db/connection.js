const mongoose = require('mongoose');

async function connect() 
{
    try
    {
        const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/project";
        await mongoose.connect(mongoUri);
        console.log('Connected to Database');

    }   
    catch(err)
    {
        console.error('Mongo connection error:', err.message);
    }
}

module.exports = connect;
