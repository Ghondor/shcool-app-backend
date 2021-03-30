function findInstitution(query, data, callback) {
    pool.query(query, data, function (error, results) {
        if (error) throw error;
        return callback(results);
    });
}

function findUser(query, data, callback) {
    pool.query(query, data, function (error, results) {
        if (error) throw error;
        return callback(results);
    });
}

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
    getInternShip: function (req, res) {
        var decodedToken = req.auth;
        pool.query('SELECT * FROM companies WHERE school_id = ? AND ', [decodedToken.school_id], (error, companies) => {
            console.log(companies);
            if (companies.length > 0) {
                return res.status(200).send(JSON.stringify({ 'status': 200, 'result': companies }));
            } else {
                return res.status(200).send(JSON.stringify({ 'status': 'There is no company', 'result': companies }));
            }
        });
    },
    createInternShip: function (req, res) {
        var decodedToken = req.auth;
        var body = req.body;

        var internshipsData = {
            student_id: body.student_id,
            company_id: body.company_id,
            teacher_id: undefined,
            school_id: undefined
        };

        findUser("SELECT * FROM students WHERE student_id = ?", internshipsData.student_id, function (student) {
            internshipsData.teacher_id = student[0].teacher_id;
            findUserTeacher(student[0].class_id, function (teacher) {
                internshipsData.teacher_id = teacher[0].teacher_id;
                internshipsData.school_id = teacher[0].school_id;
                console.log(internshipsData);
                pool.query('INSERT INTO internships SET ?', internshipsData, (error, results) => {
                   
                    if (results) {
                        return res.status(200).send(JSON.stringify({ 'status': 200, 'result': 'OK' }));
                    } else {
                        return res.status(200).send(JSON.stringify({ 'status': 200, 'result': 'Something went wrong..' }));
                    }
                })
            });
        });
    },
}

