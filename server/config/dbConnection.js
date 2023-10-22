const { default: mongoose } = require("mongoose");
const dotenv = require('dotenv').config();

const connect = async () => {
    try {
        await mongoose.connect(process.env.DB_KEY, {
        });
        console.log('Connected to MongoDB: ' + process.env.DB_KEY.split('/')[3]);
    } catch (error) {
        console.log(error);
    }
}

module.exports = connect;