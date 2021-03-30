
function findInstitution(query, data, callback) {
    pool.query(query, data, function (error, results) {
        if (error) throw error;
        return callback(results);
    });
}

module.exports = {
    profile: function (req, res) {
        var decodedToken = req.auth;
        pool.query('SELECT * FROM `students` WHERE student_id = ? and role = ?', [decodedToken.id, decodedToken.role], (error, student) => {
            if (student.length > 0) {
                return res.status(200).send(JSON.stringify({ 'status': 200, 'result': student }));
            } else {
                pool.query('SELECT * FROM `teachers` WHERE teacher_id = ?', [decodedToken.id, decodedToken.role], (error, teacher) => {
                    if (teacher.length > 0) {
                        return res.status(200).send(JSON.stringify({ 'status': 200, 'result': teacher }));
                    }
                    else {
                        return res.status(200).send(JSON.stringify({ 'status': 'Wrong credentials', 'result': teacher }));
                    }

                });
            }
        });
    },
    studentProfileUpdate: function (req, res) {
        var decodedToken = req.auth;
        var body = req.body;
        var studentProfile = {};

        if (body.password === "") {
            studentProfile = {
                email: body.email,
                phone: body.phone
            };
        } else {
            studentProfile = {
                email: body.email,
                password: md5(body.password),
                phone: body.phone
            };
        }

        pool.query('UPDATE students SET ? WHERE student_id = ?', [studentProfile, decodedToken.id], (error, results) => {
            if (results) {
                return res.status(200).send(JSON.stringify({ 'status': 200, 'result': 'OK' }));
            } else {
                return res.status(200).send(JSON.stringify({ 'status': 200, 'result': 'Something went wrong..' }));
            }
        });

    },
    studentPictureUpdate: function (req, res) {
        var decodedToken = req.auth;
        var body = req.body;

        var studentProfile = {
            image: body.image
        };

        pool.query('UPDATE students SET ? WHERE student_id = ?', [studentProfile, decodedToken.id], (error, results) => {
            if (results) {
                return res.status(200).send(JSON.stringify({ 'status': 200, 'result': 'OK' }));
            } else {
                return res.status(200).send(JSON.stringify({ 'status': 200, 'result': 'Something went wrong..' }));
            }
        });

    },
    teacherList: function (req, res) {
        var decodedToken = req.auth;
        var school_id = req.body.school_id;

        pool.query('SELECT * FROM teachers WHERE school_id = ?', [school_id], (error, student) => {
            if (student.length > 0) {
                return res.status(200).send(JSON.stringify({ 'status': 200, 'result': student }));
            } else {
                return res.status(200).send(JSON.stringify({ 'status': 'There is no Student', 'result': student }));
            }
        });

    },
    studentList: function (req, res) {
        var decodedToken = req.auth;
        var class_id = req.body.class_id;

        pool.query('SELECT * FROM student_classes INNER JOIN classes ON student_classes.class_id = classes.class_id INNER JOIN school ON student_classes.school_id = school.school_id INNER JOIN students ON student_classes.student_id = students.student_id WHERE student_classes.class_id = ?', [class_id], (error, student) => {
            if (student.length > 0) {
                return res.status(200).send(JSON.stringify({ 'status': 200, 'result': student }));
            } else {
                return res.status(200).send(JSON.stringify({ 'status': 'There is no Student', 'result': student }));
            }
        });
    },
    teacherEditProfile: function (req, res) {
        var decodedToken = req.auth;
        var body = req.body;

        var teacherProfile = {
            email: body.email,
            password: md5(body.password),
            phone: body.phone
        };

        pool.query('UPDATE teachers SET ? WHERE teacher_id = ?', [teacherProfile, decodedToken.id], (error, results) => {
            if (results) {
                return res.status(200).send(JSON.stringify({ 'status': 200, 'result': 'OK' }));
            } else {
                return res.status(200).send(JSON.stringify({ 'status': 200, 'result': 'Something went wrong..' }));
            }
        });

    },
    teacherProfile: function (req, res) {
        var decodedToken = req.auth;
        pool.query('SELECT * FROM `teachers` WHERE teacher_id = ?', [decodedToken.id], (error, admin) => {
            if (admin.length > 0) {
                return res.status(200).send(JSON.stringify({ 'status': 200, 'result': admin }));
            } else {
                return res.status(200).send(JSON.stringify({ 'status': 'Wrong credentials', 'result': error }));
            }
        });
    },
    profilePicture: function (req, res) {
        var decodedToken = req.auth;
        var body = req.body;

        var teacherProfile = {
            image: body.image
        };

        pool.query('UPDATE teachers SET ? WHERE teacher_id = ?', [teacherProfile, decodedToken.id], (error, results) => {
            if (results) {
                return res.status(200).send(JSON.stringify({ 'status': 200, 'result': 'OK' }));
            } else {
                return res.status(200).send(JSON.stringify({ 'status': 200, 'result': 'Something went wrong..' }));
            }
        });

    },
    studentCreate: function (req, res) {
        var decodedToken = req.auth;
        var body = req.body;

        var studentData = {
            firstname: body.firstname,
            lastname: body.lastname,
            email: body.email,
            username: `${(body.firstname).toLowerCase()}.${(body.lastname).toLowerCase()}`,
            password: md5('ChangeMe#2'),
            phone: body.phone,
            country: body.country,
            class_id: body.class_id,
            role: 'S',
        };

        pool.query('INSERT INTO students SET ?', studentData, (error, results) => {
            if (results) {
                findInstitution("SELECT * FROM classes INNER JOIN school ON classes.school_id = school.school_id WHERE classes.class_id = ?", body.class_id, function (result) {

                    var studen_classes = {
                        student_id: results.insertId,
                        class_id: body.class_id,
                        school_id: result[0].school_id
                    };
                    pool.query('INSERT INTO student_classes SET ?', studen_classes, (error, results) => {
                        if (results) {
                            return res.status(200).send(JSON.stringify({ 'status': 200, 'result': 'OK' }));
                        } else {
                            return res.status(200).send(JSON.stringify({ 'status': 200, 'result': 'Something went wrong..' }));
                        }
                    })
                });
            } else {
                console.log(error);
                return res.status(200).send(JSON.stringify({ 'status': 200, 'result': 'Something went wrong..' }));
            }
        });

    },
    companyCreate: function (req, res) {
        var decodedToken = req.auth;
        var body = req.body;

        var companyData = {
            school_id: decodedToken.school_id,
            logo: body.logo,
            country: body.country,
            name: body.name
        };

        pool.query('INSERT INTO companies SET ?', companyData, (error, results) => {
            if (results) {
                return res.status(200).send(JSON.stringify({ 'status': 200, 'result': 'OK' }));
            } else {
                return res.status(200).send(JSON.stringify({ 'status': 200, 'result': 'Something went wrong..' }));
            }
        })

    },
    companyList: function (req, res) {
        var decodedToken = req.auth;
        pool.query('SELECT * FROM companies WHERE school_id = ?', [decodedToken.school_id], (error, companies) => {
            console.log(companies);
            if (companies.length > 0) {
                return res.status(200).send(JSON.stringify({ 'status': 200, 'result': companies }));
            } else {
                return res.status(200).send(JSON.stringify({ 'status': 'There is no company', 'result': companies }));
            }
        });
    },
    teacherReadEssay: function (req, res) { // Read Essay
        var decodedToken = req.auth;
        var body = req.body;
        pool.query('SELECT * FROM tasks WHERE task_id = ?', [body.task_id], (error, essay) => {
            if (essay.length > 0) {
                return res.status(200).send(JSON.stringify({ 'status': 200, 'result': essay }));
            } else {
                return res.status(200).send(JSON.stringify({ 'status': 'There is no company', 'result': essay }));
            }
        });
    },
    teacherUpdateScoreForEssay: function (req, res) { // Give point to Essay
        var decodedToken = req.auth;
        var body = req.body;

        var studentScore = {
            score: body.score
        };

        pool.query('UPDATE student_scores SET ? WHERE task_id = ?', [body.task_id, decodedToken.id], (error, results) => {
            if (results) {
                return res.status(200).send(JSON.stringify({ 'status': 200, 'result': 'OK' }));
            } else {
                return res.status(200).send(JSON.stringify({ 'status': 200, 'result': 'Something went wrong..' }));
            }
        });
    },
    teacherPermission: function (req, res) {
        var decodedToken = req.auth;
        var body = req.body;
        var permissions = {
            canAddLevel: undefined,
            canAddReport: undefined
        }
        pool.query('SELECT * FROM teachers WHERE teacher_id = ?', [decodedToken.id], (error, results) => {
            if (results) {
                permissions.canAddLevel = results[0].canAddLevel;
                permissions.canAddReport = results[0].canAddReport;
                return res.status(200).send(JSON.stringify({ 'status': 200, 'result': permissions }));
            } else {
                return res.status(200).send(JSON.stringify({ 'status': 200, 'result': 'Something went wrong..' }));
            }
        });
    }
}

