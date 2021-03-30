Object.defineProperty(Array.prototype, "chunk", {
  value: function(chunkSize) {
    var temporal = [];
    for (var i = 0; i < this.length; i += chunkSize) {
      temporal.push(this.slice(i, i + chunkSize));
    }
    return temporal;
  }
});

function updateLevel(level_id, teacher_id, desc, callback) {
  var levelData = {
    description: desc
  };
  pool.query(
    "UPDATE levels SET ? WHERE teacher_id = ? AND id = ?",
    [levelData, teacher_id, level_id],
    (error, results) => {
      if (results) {
        return callback("OK");
      } else {
        return callback("NO");
      }
    }
  );
}

module.exports = {
  // This object function creates levels with questions
  create: function(req, res) {
    var decodedToken = req.auth;
    var teacher_school = req.user[0].school_id; //Find Teacher Profile using findUser helper
    var taskPayload = req.body.taskPayload; //Get Array of arrays
    var description = req.body.description; //Get Array of arrays

    console.log("PAYLOAD : ", taskPayload);

    pool.query(
      "SELECT * FROM levels WHERE school_id = ?",
      teacher_school,
      (error, results) => {
        var lengthLevel = results.length;
        if (lengthLevel < 9) {
          var levelNumber = lengthLevel + 1;
          var levelPayload = {
            school_id: teacher_school,
            teacher_id: decodedToken.id,
            level_number: levelNumber,
            description: description
          };

          pool.query(
            "INSERT INTO levels SET ?",
            levelPayload,
            (error, results) => {
              var lastID = results.insertId;
              if (results) {
                new Promise(function(resolve, reject) {
                  taskPayload.map(function(element) {
                    var level_id = eval('"' + lastID + '"');
                    element[9] = null;
                    element[10] = level_id;
                  });
                  resolve(taskPayload);
                }).then(function(taskPayloadData) {
                  pool.query(
                    "INSERT INTO tasks (task_title, question, first_answer, second_answer, third_answer, points, correct_answer, minute, second, essay, level_id) VALUES ?",
                    [taskPayloadData],
                    (error, results) => {
                      if (results) {
                        return res
                          .status(200)
                          .send(JSON.stringify({ status: 200, result: "OK" }));
                      } else {
                        console.log("inside : ", error);
                        return res.status(200).send(
                          JSON.stringify({
                            status: 200,
                            result: "Something went wrong.."
                          })
                        );
                      }
                    }
                  );
                });
              } else {
                return res.status(200).send(
                  JSON.stringify({
                    status: 200,
                    result: "Something went wrong.."
                  })
                );
              }
            }
          );
        } else {
          return res.status(200).send(
            JSON.stringify({
              status: 200,
              result: "School reached the maximum number of levels"
            })
          );
        }
      }
    );
  },
  taskUpdate: function(req, res) {
    var decodedToken = req.auth;
    var teacher_school = req.user[0].school_id; //Find Teacher Profile using findUser helper
    var taskPayload = req.body.taskPayload;
    var description = req.body.description;
    var level_id = req.body.level_id;
    var task_id = undefined;
    var counter = 0;

    new Promise(function(resolve, reject) {
      taskPayload.map(function(task) {
        if (counter == 8) {
        } else {
          task_id = task[9];
          var taskUpdate = {
            task_title: task[0],
            question: task[1],
            first_answer: task[2],
            second_answer: task[3],
            third_answer: task[4],
            points: task[5],
            correct_answer: task[6],
            essay: null,
            minute: task[7],
            second: task[8]
          };
        }
        console.log(task_id);
        pool.query(
          "UPDATE tasks SET ? WHERE task_id = ?",
          [taskUpdate, task_id],
          (error, results) => {
            if (results) {
              updateLevel(level_id, decodedToken.id, description, function(
                updateLevel
              ) {});
            } else {
            }
          }
        );
      });
      resolve();
    }).then(function() {
      return res
        .status(200)
        .send(JSON.stringify({ status: 200, result: "OK" }));
    });
  },
  getTaskByID: function(req, res) {
    var decodedToken = req.auth;
    var level_id = req.body.level_id;

    pool.query(
      "SELECT * FROM levels INNER JOIN tasks ON levels.id = tasks.level_id WHERE tasks.level_id = " +
        level_id +
        " ORDER BY tasks.task_id",
      (error, results) => {
        if (results.length > 0) {
          // var result = results.chunk(9);
          return res
            .status(200)
            .send(JSON.stringify({ status: 200, result: results }));
        } else {
          return res
            .status(200)
            .send(JSON.stringify({ status: "There is no record" }));
        }
      }
    );
  },
  getSchoolLevelCount: function(req, res) {
    //Get Level of Specific School
    var decodedToken = req.auth;
    var teacher_school = req.user[0].school_id; //Find Teacher Profile using findUser helper and get the school id

    pool.query(
      "SELECT COUNT(school_id) FROM levels where school_id = ?",
      [teacher_school],
      (error, results) => {
        if (results.length > 0) {
          return res.status(200).send(
            JSON.stringify({
              status: 200,
              result: results[0]["COUNT(school_id)"]
            })
          );
        } else {
          return res
            .status(200)
            .send(JSON.stringify({ status: "There is no record" }));
        }
      }
    );
  },
  getLevelList: function(req, res) {
    var decodedToken = req.auth;
    var teacher_school = req.user[0].school_id; //Find Teacher Profile using findUser helper and get the school id
    pool.query(
      "SELECT * FROM levels INNER JOIN tasks ON levels.id = tasks.level_id INNER JOIN teachers ON levels.teacher_id = teachers.teacher_id WHERE levels.school_id = " +
        teacher_school +
        " ORDER BY tasks.task_id",
      (error, results) => {
        if (results.length > 0) {
          var result = results.chunk(9);
          return res
            .status(200)
            .send(JSON.stringify({ status: 200, result: result }));
        } else {
          return res
            .status(200)
            .send(JSON.stringify({ status: "There is no record" }));
        }
      }
    );
  }
};
