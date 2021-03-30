module.exports = {
    create: function (req, res) {
        var decodedToken = req.auth;

        var classObj = {
            class_name: req.body.class_name,
            teacher_id: req.body.teacher_id,
            school_id: req.body.school_id   
        };

        pool.query('INSERT INTO classes SET ?', classObj, (error, results) => {
            if (results) {
                return res.status(200).send(JSON.stringify({ 'status': 200, 'result': 'OK' }));
            } else {
                return res.status(200).send(JSON.stringify({ 'status': 200, 'result': 'Something went wrong..' }));
            }
        });

    },
    getList: function (req, res) {
        var school_id = req.user[0].school_id;
        var query = `
        SELECT class_id, class_name, teachers.firstname, teachers.lastname, school.school_name
        FROM classes 
        INNER JOIN teachers 
            ON classes.teacher_id = teachers.teacher_id
        INNER JOIN school 
            ON classes.school_id = teachers.school_id
        WHERE school.school_id = ?
        `;
        pool.query(query, school_id, (error, classes) => {
            if (classes.length > 0) {
                return res.status(200).send(JSON.stringify({ 'status': 200, 'result': classes }));
            } else {
                return res.status(200).send(JSON.stringify({ 'status': 'Something Went Wrong', 'result': classes }));
            }
        });
    },
    getClass: (req, res) => {
        var class_id = req.params.id;
        pool.query('SELECT class_name FROM `classes` WHERE class_id=' + class_id, (error, results) => {
            if (results.length > 0) {
                return res.status(200).send(JSON.stringify({ 'status': 200, 'result': results }));
            } else {
                return res.status(200).send(JSON.stringify({ 'status': 'Something went wrong', 'result': results }));
            }
        });
    }
}
