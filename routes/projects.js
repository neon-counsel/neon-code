var express = require('express');
var router = express.Router();
var Project = require('../models/project');
var jwt = require('jsonwebtoken');
var moment = require('moment');

//Verify a JWT
function verifyJWT(jwtString){
    var value = jwt.verify(jwtString, 'insertmessagehere');
    return value;
  }
  

router.get('/', function(req, res, next){
    try {
        var jwtString = req.cookies.Authorization.split(" ");
        var profile = verifyJWT(jwtString[1]);
        
        if (profile) {
            Project.find({}, function(err, projects) {
        
                res.render('explore', { title: 'Neon Code', profile: profile, projects: projects});
            });
        }
    } catch (err) {
        Project.find({publicORprivate: "public"}, function(err, projects) {
        
            res.render('explore', { title: 'Neon Code', projects: projects});
        });
    }
});

router.get('/:user/:project', function(req, res, next){
    var user = req.params.user;
    var project = req.params.project;

    try {
        var jwtString = req.cookies.Authorization.split(" ");
        var profile = verifyJWT(jwtString[1]);
        
        if (profile) {
            Project.findOne({user_id: user, project_name: project}, function(err, project) {
                if(err)
                    res.send(err);
                
                var created = moment(project.when_created).format("DD/MM/YYYY");
                res.render('project', { title: 'Neon Code', profile: profile, project: project, created: created});
            });
        }
    } catch (err) {
        Project.find({publicORprivate: "public"}, function(err, projects) {
        
            res.render('explore', { title: 'Neon Code', projects: projects});
        });
    }
});


router.post('/new', function(req, res, next){
    try {
        var jwtString = req.cookies.Authorization.split(" ");
        var profile = verifyJWT(jwtString[1]);
        
        if (profile) {
            var projectname = req.body.project_name;
            var description = req.body.description;
            var privacy = req.body.privacy;
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
                    newProject.project_description = description;
                    newProject.publicORprivate = privacy;
                    newProject.when_created = new Date();
                    newProject.user_id = profile.user_name;
                    newProject.save(function(err, project){
                        if(err)
                            throw err;
                        res.json({ 'Success': "Project created"});
                    });
                }
            });
        }
    } catch (err) {
        res.status(401).json({
            "status": "info",
            "body": "Not allowed."
        });
    }
});

// router.get('/', function(req, res) {
//     Project.find({}, function(err, projects) {
//         var projectMap = {};

//         projects.forEach(function(project){
//             projectMap[project.project_name] = project;
//         });

//         res.send(projectMap);
//     });
// });

module.exports = router;
