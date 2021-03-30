module.exports = {
  reportCreate: function(req, res) {
    var decodedToken = req.auth;
    var teacher_profile = req.studentTeacher[0];
    var body = req.body;

    var reportData = {
      teacher_id: decodedToken.id,
      student_id: body.student_id,
      company_id: body.company_id,
      report: body.report
    };

    pool.query("INSERT INTO reports SET ?", reportData, (error, results) => {
      if (results) {
        return res
          .status(200)
          .send(JSON.stringify({ status: 200, result: "OK" }));
      } else {
        return res
          .status(200)
          .send(
            JSON.stringify({ status: 200, result: "Something went wrong.." })
          );
      }
    });
  },
  getReports: function(req, res) {
    var decodedToken = req.auth;
    var body = req.body;

    pool.query(
      `
        SELECT *, companies.name as company_name, teachers.firstname as teacher_name, students.firstname as student_name, students.lastname as student_lastname
        FROM internships 
        INNER JOIN school 
            ON internships.school_id = school.school_id
        INNER JOIN teachers 
            ON internships.teacher_id = teachers.teacher_id
        INNER JOIN companies 
            ON internships.company_id = companies.company_id
        INNER JOIN students
            ON internships.student_id = students.student_id
        `,
      (error, results) => {
        if (results.length > 0) {
          return res
            .status(200)
            .send(JSON.stringify({ status: 200, result: results }));
        } else {
          return res
            .status(200)
            .send(
              JSON.stringify({ status: 200, result: "Something went wrong.." })
            );
        }
      }
    );
  }
};
