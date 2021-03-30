function findInstitution(query, data, callback) {
    pool.query(query, data, function (error, results) {
        if (error) throw error;
        return callback(results);
    });
}

module.exports = {
    profile: function (req, res) {
        var decodedToken = req.auth;
        pool.query('SELECT * FROM `admins` WHERE id = ?', [decodedToken.id], (error, admin) => {
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

        var adminProfile = {
            image: body.image
        };

        pool.query('UPDATE admins SET ? WHERE id = ?', [adminProfile, decodedToken.id], (error, results) => {
            if (results) {
                return res.status(200).send(JSON.stringify({ 'status': 200, 'result': 'OK' }));
            } else {
                return res.status(200).send(JSON.stringify({ 'status': 200, 'result': 'Something went wrong..' }));
            }
        });

    },
    edit: function (req, res) {

        var decodedToken = req.auth;
        var body = req.body;
        var adminProfile = {};
  

        if (body.password === "") {
            adminProfile = {
                email: body.email,
                phone: body.phone
            };
        } else {
            adminProfile = {
                email: body.email,
                password: md5(body.password),
                phone: body.phone
            };
        }

        pool.query('UPDATE admins SET ? WHERE id = ?', [adminProfile, decodedToken.id], (error, results) => {
            if (results) {
                return res.status(200).send(JSON.stringify({ 'status': 200, 'result': 'OK' }));
            } else {
                return res.status(200).send(JSON.stringify({ 'status': 200, 'result': 'Something went wrong..' }));
            }
        });

    },
    teacherCreate: function (req, res) {
        var decodedToken = req.auth;
        var body = req.body;

        findInstitution("SELECT * FROM school WHERE school_id = ?", decodedToken.school_id, function (result) {
            var teacherData = {
                firstname: body.firstname,
                lastname: body.lastname,
                email: body.email,
                username: `${(body.firstname).toLowerCase()}.${(body.lastname).toLowerCase()}`,
                password: md5('ChangeMe#2'),
                phone: body.phone,
                country: body.country,
                role: 'T',
                school_id: result[0].school_id,
                canAddLevel: body.canAddLevel == "true" ? 1 : 0,
                canAddReport: body.canAddReport == "true" ? 1 : 0,
                canAddTask: body.canAddTask == "true" ? 1 : 0,
            };
            pool.query('INSERT INTO teachers SET ?', teacherData, (error, results) => {
                if (results) {
                    return res.status(200).send(JSON.stringify({ 'status': 200, 'result': 'OK' }))
                } else {
                    console.log(error);
                    return res.status(200).send(JSON.stringify({ 'status': 200, 'result': 'Something went wrong..' }));
                }
            });

        });
    },
    teacherList: function (req, res) {
        var decodedToken = req.auth;

        pool.query('SELECT * FROM teachers INNER JOIN school ON teachers.school_id = school.school_id WHERE school.school_id = ?', [decodedToken.school_id], (error, student) => {
            if (student.length > 0) {
                return res.status(200).send(JSON.stringify({ 'status': 200, 'result': student }));
            } else {
                return res.status(200).send(JSON.stringify({ 'status': 'There is no Teacher', 'result': student }));
            }
        });

    },
}