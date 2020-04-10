var express = require('express');
var router = express.Router();
var User = require('../models/users');
var Project = require('../models/project');
var fp = require("find-free-port")
var jwt = require('jsonwebtoken');
const { Docker } = require('node-docker-api');


const docker = new Docker({ socketPath: '/var/run/docker.sock' });
var moment = require('moment');
var md = require('markdown-it')();
var fs = require('fs');

//Verify a JWT
function verifyJWT(jwtString) {
    var value = jwt.verify(jwtString, 'insertmessagehere');
    return value;
}

router.get('/', function (req, res, next) {
    try {
        var jwtString = req.cookies.Authorization.split(" ");
        var profile = verifyJWT(jwtString[1]);

        if (profile) {
            Project.find({ publicORprivate: "public" }, function (err, projects) {

                res.render('explore', { title: 'Neon Code', profile: profile, projects: projects });
            });
        }
    } catch (err) {
        Project.find({ publicORprivate: "public" }, function (err, projects) {

            res.render('explore', { title: 'Neon Code', projects: projects });
        });
    }
});

router.get('/:user/:project', function (req, res, next) {
    var user = req.params.user;
    var project = req.params.project;

    try {
        var jwtString = req.cookies.Authorization.split(" ");
        var profile = verifyJWT(jwtString[1]);

        if (profile) {
            Project.findOne({ user_id: user, project_name: project }, function (err, project) {
                if (err) {
                    res.send(err);
                    return;
                }
                if (project != null && (project.publicORprivate == "public" || profile.user_name == user)) {
                    try {
                        var rFile = fs.readFileSync(process.env.PROJECTDIR || (process.env.HOME + '/projects/') + project.user_id + '/' + project.project_name + '/README.md');
                        var readme = md.render(rFile.toString());
                    } catch (err) {
                        var readme = '';
                    }

                    var created = moment(project.when_created).format("DD/MM/YYYY");
                    var stars = project.stars.length;
                    res.render('project', { title: 'Neon Code', profile: profile, project: project, created: created, readme: readme, stars: stars });
                } else {
                    res.status(404).render('error', { title: 'Neon Code', profile: profile, message: "Not found" });

                }

            });
        }
    } catch (err) {
        Project.findOne({ user_id: user, project_name: project }, function (err, project) {
            if (err) {
                res.send(err);
                return;
            }else{
                if (project.publicORprivate == "public") {
                    var created = moment(project.when_created).format("DD/MM/YYYY");
                    res.render('project', { title: 'Neon Code', profile: profile, project: project, created: created });
                } else {
                    res.status(404).render('error', { title: 'Neon Code', profile: profile, message: "Not found" });
                }
            }
            


        });
    }
});

router.post('/new', function (req, res, next) {
    try {
        var jwtString = req.cookies.Authorization.split(" ");
        var profile = verifyJWT(jwtString[1]);

        if (profile) {
            var projectname = req.body.project_name;
            var description = req.body.description;
            var privacy = req.body.privacy;
            if (projectname === "") {
                res.status(401).json({
                    "status": "info",
                    "body": "Not allowed.",
                    "redirect": ""
                });
                return;
            }
            Project.findOne({ 'project_name': projectname }, function (err, project) {
                if (err)
                    res.send(err);

                if (project) {
                    res.status(401).json({
                        "status": "info",
                        "body": "Project name already taken"
                    });
                } else {
                    var newProject = new Project();

                    newProject.project_name = projectname;
                    newProject.project_description = description;
                    newProject.publicORprivate = privacy;
                    newProject.when_created = new Date();
                    newProject.user_id = profile.user_name;
                    newProject.save(function (err, project) {
                        if (err)
                            throw err;

                        var dir = process.env.PROJECTDIR || (process.env.HOME + '/projects/') + project.user_id + "/" + project.project_name;
                        User.findOne({ 'user_name': profile.user_name }, function (err, user) {
                            if (err) {
                                res.send(404);
                                return;
                            } else {
                                fp(3500, 27000, function (err, freePort) {
                                    docker.container.create({
                                        Image: 'neoncounsel/neon-code',
                                        name: project._id + '',
                                        HostConfig: {
                                            Binds: [dir + ":/code:rw"],
                                            PortBindings: { "8080/tcp": [{ HostIp: "127.0.0.1", HostPort: freePort + '' }] }
                                        }
                                    }).then((container) => container.start()).then((container) => {
                                        User.updateOne({ user_name: profile.user_name }, { Container: container }).exec();
                                    }).catch(error => console.log(error));
                                    User.updateOne({ user_name: profile.user_name }, { port: freePort + '' }).exec();
                                });
                            }



                            fs.mkdirSync(dir, { recursive: true })
                            fs.writeFileSync(dir + "/README.md", '# ' + project.project_name);
                            res.json({ 'Success': "Project created", "redirect": "/projects/" + project.user_id + "/" + project.project_name });
                        });
                    });
                }
            });
        }
    } catch (err) {
        res.status(401).json({
            "status": "info",
            "body": "Not allowed.",
            "redirect": ""
        });
    }
});



router.get('/:user/:project/edit', function (req, res, next) {
    var user = req.params.user;
    var project = req.params.project;

    try {
        var jwtString = req.cookies.Authorization.split(" ");
        var profile = verifyJWT(jwtString[1]);

        if (profile) {
            Project.findOne({ user_id: user, project_name: project }, function (err, project) {
                if (err)
                    res.send(err);

                res.render('editor', { title: 'Neon Code', profile: profile, project: project, cookie: jwtString[1] });
            });
        }
    } catch (err) {
        Project.findOne({ user_id: user, project_name: project, publicORprivate: "public" }, function (err, project) {
            if (err)
                res.status(401).json({
                    "status": "info",
                    "body": "Not allowed.",
                    "redirect": ""
                });

            res.render('project', { title: 'Neon Code', profile: profile, project: project });
        });
    }
});

router.post('/:user/:project/star', function (req, res, next) {
    var user = req.params.user;
    var project = req.params.project;

    try {
        var jwtString = req.cookies.Authorization.split(" ");
        var profile = verifyJWT(jwtString[1]);

        if (profile) {
            Project.findOne({ user_id: user, project_name: project }, function (err, project) {
                if (err) {
                    res.send(err);
                    return;
                } else {
                    project.stars.push(profile.user_id);
                    project.save();
                    res.json({
                        "status": "info",
                        "body": "Liked",
                        "redirect": ""
                    });
                }



            });
        }
    } catch (err) {
        res.status(401).json({
            "status": "info",
            "body": "Not allowed.",
            "redirect": ""
        });

    }
});

router.post('/:user/:project/save', function (req, res, next) {
    var user = req.params.user;
    var project = req.params.project;

    try {
        var jwtString = req.cookies.Authorization.split(" ");
        var profile = verifyJWT(jwtString[1]);

        if (profile) {
            var projectname = req.body.project_name;
            var description = req.body.description;
            var privacy = req.body.privacy;
            if (projectname === "") {
                res.status(401).json({
                    "status": "info",
                    "body": "Not allowed.",
                    "redirect": ""
                });
                return;
            }
            if (profile.user_name == user) {
                try {
                    Project.updateOne({ user_id: user, project_name: project }, { project_name: projectname, project_description: description, publicORprivate: privacy }).then(result => {
                        res.json({
                            "status": "info",
                            "body": "Saved",
                            "redirect": "./" + projectname
                        });
                    })

                } catch (e) {
                    res.send(e);
                }


            }

        }
    } catch (err) {
        res.status(401).json({
            "status": "info",
            "body": "Not allowed.",
            "redirect": ""
        });

    }
});

router.post('/:user/:project/delete', function (req, res, next) {
    var user = req.params.user;
    var project = req.params.project;

    try {
        var jwtString = req.cookies.Authorization.split(" ");
        var profile = verifyJWT(jwtString[1]);

        if (profile) {
            if (profile.user_name == user) {
                try {
                    Project.deleteOne({ user_id: user, project_name: project }).then(result => {
                        res.json({
                            "status": "info",
                            "body": "Deleted",
                            "redirect": "/"
                        });
                    });

                } catch (e) {
                    res.send(e);
                }


            }

        }
    } catch (err) {
        res.status(401).json({
            "status": "info",
            "body": "Not allowed.",
            "redirect": ""
        });

    }
});


module.exports = router;
