var mongoose = require('mongoose');
var Schema = mongoose.Schema;
require('./util');

var projectsSchema = new Schema({
    project_name: { type: String },
    location: { type: String },
    user_id: { type: String },
    when_created: { type: Date },
    project_description: { type: String },
    publicORprivate: { type: int}
});

module.exports = mongoose.model('Project', projectsSchema);