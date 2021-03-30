
function findInstitution(query, data, callback) {
    pool.query(query, data, function (error, results) {
        if (error) throw error;
        return callback(results);
    });
}

module.exports = {
    //Get Student Results
    getResults: function (req, res) {
        var decodedToken = req.auth;
        var body = req.body;

        pool.query('SELECT * FROM general_results WHERE level_number = ?', [body.page_number], (error, results) => {
            if (results.length > 0) {
                return res.status(200).send(JSON.stringify({ 'status': 200, 'result': results }));
            } else {
                return res.status(200).send(JSON.stringify({ 'status': 'There is no result', 'result': results }));
            }
        });
    },
    getCurrentStudentResults: function (req, res) {
        var decodedToken = req.auth;
        var body = req.body;

        pool.query("SELECT * FROM student_scores WHERE student_id = " + body.student_id + " AND level_number = " + body.level_number + " ", function (error, results) {
            if (results.length > 0) {
                return res.status(200).send(JSON.stringify({ 'status': 200, 'result': results }));

            } else {
                return res.status(200).send(JSON.stringify({ 'status': 'There is no record', 'result': -1 }));
            }
        });
    },
    getCurrentStudentEssay: function (req, res) {
        var decodedToken = req.auth;
        var body = req.body;

        pool.query("SELECT * FROM student_scores WHERE student_id = " + body.student_id + " AND level_number = " + body.level_number + " AND isEssay = 1 ", function (error, results) {
            if (results.length > 0) {
                return res.status(200).send(JSON.stringify({ 'status': 200, 'result': results }));

            } else {
                return res.status(200).send(JSON.stringify({ 'status': 'There is no record', 'result': -1 }));
            }
        });
    }
}

