function findUserTeacher(class_id, callback) {
    pool.query("SELECT * FROM classes WHERE class_id = ?", class_id, function (error, results) {
        if (results) {
            pool.query("SELECT * FROM teachers WHERE teacher_id = ?", results[0].teacher_id, function (error, teacher) {
                return callback(teacher);
            });
        } else {
            return res.status(200).send(JSON.stringify({ 'status': 200, 'result': 'Something went wrong..' }));
        }
    });
}


module.exports = {
    findTeacher: function (req, res, next) {
        var decodedToken = req.auth;
        pool.query('SELECT * FROM teachers WHERE teacher_id = ?', decodedToken.id, (error, results) => {
            if (results) {
                req['user'] = results;
                next();
            } else {
                return res.status(200).send(JSON.stringify({ 'status': 200, 'result': 'Something went wrong..' }));
            }
        });
    },
    findStudent: function (req, res, next) {
        var decodedToken = req.auth;
        pool.query('SELECT * FROM students WHERE student_id = ?', decodedToken.id, (error, results) => {
            if (results) {
                findUserTeacher(results[0].class_id, function (studentTeacher) {
                    req['studentTeacher'] = studentTeacher; // Particular Students's Teacher Profile
                    req['user'] = results; // Student Profile
                    next(); // Arrideverci!
                });
            } else {
                return res.status(200).send(JSON.stringify({ 'status': 200, 'result': 'Something went wrong..' }));
            }
        });
    }
}