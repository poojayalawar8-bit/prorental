const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/prorental';
    const conn = await mongoose.connect(connUri);
    console.log(`[MongoDB] Connected to database: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB] Connection notice: ${error.message}`);
    console.warn(`[MongoDB] Ensure your MongoDB service is running or update MONGO_URI in server/.env`);
  }
};

module.exports = connectDB;
