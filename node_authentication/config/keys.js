const prodCredentials = require('./keys/production');
const devCredentials = require('./keys/development');

if ((process.env.NODE_ENV || 'development') === 'production') {
  console.log('------------------------------------');
  console.log('Sending/Using Production Credentials.');
  console.log('------------------------------------');
  module.exports = prodCredentials;
} else {
  console.log('------------------------------------');
  console.log('Sending/Using Development Credentials.');
  console.log('------------------------------------');
  module.exports = devCredentials;
}
