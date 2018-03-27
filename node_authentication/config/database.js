const mongoose = require('mongoose');
const keys = require('./keys'); // mongoDB URI (secret)

mongoose.connect(keys.mongoURI);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection Error!'));
db.once('open', () => {
  console.log('MongoDB connection established successfully!');
});

module.exports = mongoose;
