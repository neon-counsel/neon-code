var mongoose = require('mongoose');
var Schema = mongoose.Schema;
require('.util');

var projectsSchema = new Schema({
    project_name: { type: String },
    location: { type: String },
    user_id: { type: String },
    when_created: { type: Date }
});

module.exports = mongoose.model('Project', projectsSchema);