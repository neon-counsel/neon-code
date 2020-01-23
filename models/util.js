var mongoose = require('mongoose');
var connection = mongoose.connect(
  'mongodb://127.0.0.1:27017/test',
  {
      useNewUrlParser: true,
      useUnifiedTopology: true
  }
);

exports.connection = connection;