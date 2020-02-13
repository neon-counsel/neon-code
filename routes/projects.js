var express = require('express');
var router = express.Router();
var Project = require('../models/project');

router.post('/new', function(req, res, next){
    var projectname = req.body.project_name;

    Project.findOne({ 'project_name': projectname }, function(err, project) {
        if(err)
            res.send(err);
        
        if(project){
            res.status(401).json({
                "status": "info",
                "body": "Project name already taken"
            });
        } else{
            var newProject = new Project();

            newProject.project_name = projectname;
            newProject.save(function(err, project){
                if(err)
                    throw err;
                res.json({ 'Success': "Project created"});
            });
        }
    });
});

router.get('/', function(req, res) {
    Project.find({}, function(err, projects) {
        var projectMap = {};

        projects.forEach(function(project){
            projectMap[project.project_name] = project;
        });

        res.send(projectMap);
    });
});

module.exports = router;
