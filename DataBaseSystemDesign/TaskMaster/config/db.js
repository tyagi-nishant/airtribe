const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Pass the URI directly, options are generally handled by the driver now
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error connecting to MongoDB: ${err.message}`);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB; 