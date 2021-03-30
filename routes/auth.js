module.exports = {
    isAuthed: function (req, res, next) {
        var bearerHeader = req.headers["authorization"];
        if (bearerHeader == null) {
            return res.status(401).send(JSON.stringify({ "Status": "Token is empty, make sure you're sending one or that you're authenticated." }));
        } else {
            var decoded = jwt.decode(bearerHeader);
            req['auth'] = decoded;
            next();
        }

    },

    login: function (req, res, next) {

        var username = req.body.username;
        var password = md5(req.body.password);

        if (username == null || password == null) {
            return res.status(401).send(JSON.stringify({ "status": "Missing credentials.", "Message": "Check your Username and Password Fields." }));
        } else {
            pool.query('SELECT * FROM `students` WHERE username = ?', [username], (error, student) => {
                if (student.length > 0) {
                    if (password === student[0].password) {
                        var token = jwt.sign({ role: student[0].role, id: student[0].student_id, username: username }, 'secret').toString();
                        return res.status(200).send(JSON.stringify({ 'status': 200, 'result': student, 'token': token }));
                    } else {
                        return res.status(200).send(JSON.stringify({ "status": "Wrong credentials.", "Message": "Check your Username and Password Fields." }));
                    }
                } else {
                    pool.query('SELECT * FROM `teachers` WHERE username = ?', [username], (error, teacher) => {
                        if (teacher.length > 0) {
                            if (password === teacher[0].password) {
                                var token = jwt.sign({ school_id: teacher[0].school_id, role: teacher[0].role, id: teacher[0].teacher_id, username: username }, 'secret').toString();
                                return res.status(200).send(JSON.stringify({ 'status': 200, 'result': teacher, 'token': token }));
                            } else {
                                return res.status(200).send(JSON.stringify({ "status": "Wrong credentials.", "Message": "Check your Username and Password Fields." }));
                            }

                        }
                        else {
                            pool.query('SELECT * FROM `admins` WHERE username = ?', [username], (error, admins) => {
                                if (admins.length > 0) {
                                    if (password === admins[0].password) {
                                        var token = jwt.sign({ school_id: admins[0].school_id, role: admins[0].role, id: admins[0].id, username: username }, 'secret').toString();
                                        return res.status(200).send(JSON.stringify({ 'status': 200, 'result': admins, 'token': token }));
                                    } else {
                                        return res.status(200).send(JSON.stringify({ "status": "Wrong credentials.", "Message": "Check your Username and Password Fields." }));
                                    }

                                }
                                else {
                                    return res.status(200).send(JSON.stringify({ 'status': 'Wrong credentials', 'result': admins }));
                                }

                            });
                        }

                    });
                }
            });
        }
    }
}

