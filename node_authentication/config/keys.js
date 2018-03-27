const prodCredentials = require('./keys/production');
const devCredentials = require('./keys/development');

if ((process.env.NODE_ENV || 'development') === 'production') {
  module.exports = prodCredentials;
} else {
  module.exports = devCredentials;
}
