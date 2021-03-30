// Find the School
function findInstitution(query, data, callback) {
  pool.query(query, data, function (error, results) {
    if (error) throw error;
    return callback(results);
  });
}

// Find the student class
function findUserClass(student_id, callback) {
  pool.query(
    "SELECT * FROM students WHERE student_id = ?",
    student_id,
    function (error, results) {
      if (error) throw error;
      return callback(results);
    }
  );
}

// Find the level number
function findLevelNumber(student_id, callback) {
  var level_number = 1;
  pool.query(
    "SELECT * FROM student_answers WHERE student_id = " +
    student_id +
    " ORDER BY student_answers.level_id",
    function (error, results) {
      if (results.length > 0) {
        level_number = results[results.length - 1].level_number + 1;
        if (level_number === 10) {
          level_number = -1;
          return callback(level_number);
        } else {
          return callback(level_number);
        }
      } else {
        level_number = 1;
        return callback(level_number);
      }
    }
  );
}

// Check the Answer on the air
function checkAnswer(task_id, answer, callback) {
  console.log(task_id, answer);
  var point = 0;
  pool.query("SELECT * FROM tasks WHERE task_id = " + task_id + "", function (
    error,
    results
  ) {
    if (results.length > 0) {
      if (answer === results[0].correct_answer) {
        point = results[0].points;
        return callback(point);
      } else {
        point = 0;
        return callback(point);
      }
    } else {
      point = 0;
      return callback(point);
    }
  });
}

function secondToMinute(d) {
  d = Number(d);
  var h = Math.floor(d / 3600);
  var m = Math.floor((d % 3600) / 60);
  var s = Math.floor((d % 3600) % 60);

  var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
  var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
  var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
  return hDisplay + mDisplay + sDisplay;
}

// General Result Submit Proc
function result_proc(level_id, student_profile, teacher_profile, callback) {
  var answerPayload = {
    level_id: level_id,
    student_name: student_profile.firstname,
    result: undefined,
    time: 0,
    teacher_name: teacher_profile.firstname,
    score: 0,
    published: 0,
    question_answered: 0,
    level_number: 0,
    student_id: student_profile.student_id
  };

  // Calculate if he / she passed or not and then give a result
  pool.query(
    "SELECT * FROM student_scores WHERE student_id = " +
    student_profile.student_id +
    " AND level_id = " +
    answerPayload.level_id +
    "",
    function (error, results) {
      if (results.length > 0) {
        new Promise(function (resolve, reject) {
          answerPayload.level_number = results[0].level_number; // Get level number OR page number
          results.map(function (element) {
            answerPayload.score =
              parseInt(answerPayload.score) + parseInt(element.score);

            answerPayload.time =
              parseInt(answerPayload.time) +
              parseInt(element.time.split(":")[1]);

            console.log("yes : ! ", answerPayload.time);

            if (element.answer !== "Empty") {
              answerPayload.question_answered =
                parseInt(answerPayload.question_answered) + parseInt(1);
            } else {
            }
          });
          resolve(answerPayload);
        }).then(function (answerPayloadData) {

          if (secondToMinute(answerPayloadData.time) === 0) {
            answerPayloadData.time = answerPayloadData.time;
          } else {
            answerPayloadData.time = secondToMinute(answerPayloadData.time);
          }
          if (answerPayloadData.score >= 50) {
            answerPayloadData.result = "Passed";
            console.log("True Database: ", answerPayloadData);
            deliverResult(answerPayloadData, function (lastResult) {
              return callback(lastResult);
            });
          } else {
            answerPayloadData.result = "Failed";
            console.log("True Database: ", answerPayloadData);
            deliverResult(answerPayloadData, function (lastResult) {
              return callback(lastResult);
            });
          }
        });
      } else {
        console.log("fired5!");
        return callback("something went wrong!");
      }
    }
  );
}

function updateLastResult(
  student_score_id,
  point,
  student_id,
  level_number,
  callback
) {
  var essayGrade = {};
  if (point >= 50) {
    essayGrade = {
      score: point,
      status: "Passed"
    };
  } else {
    essayGrade = {
      score: point,
      status: "Failed"
    };
  }
  pool.query(
    "UPDATE student_scores SET ? WHERE student_score_id = ?",
    [essayGrade, student_score_id],
    (error, results) => {
      console.log("Habari : ", results);
      if (results) {
        updateScoreTable(student_id, function (temp_point) {
          console.log("Temp Point: ", temp_point);
          var score = {
            score: parseInt(temp_point[0].score) + parseInt(point),
            result: undefined
          };

          if (score.score < 50) {
            score.result = "Failed";
          } else if (score.score > 50) score.result = "Passed";

          console.log("Scoreeeee : ", score);
          pool.query(
            "UPDATE general_results SET ? WHERE student_id = ? AND level_number = ?",
            [score, student_id, level_number],
            (error, results) => {
              if (results) {
                console.log("Alright: ", results);
                return callback("OK");
              } else {
                return callback("NO");
              }
            }
          );
        });
      } else {
        return callback("NO");
      }
    }
  );
}

function updateScoreTable(student_id, callback) {
  console.log("student id : ", student_id);
  pool.query(
    "SELECT * FROM general_results WHERE student_id = " + student_id,
    (error, results) => {
      console.log(results);
      return callback(results);
    }
  );
}

// Fire in each student answer to keep results updated
function updateGeneralResults(payload, callback) {
  pool.query(
    "SELECT * FROM general_results WHERE student_id = " + payload.student_id,
    (error, results) => {
      if (results.length > 0) {
        var score = {
          score: parseInt(results[0].score) + parseInt(payload.score)
        };

        if (score.score < 50) {
          score.result = "Failed";
        } else if (score.score > 50) score.result = "Passed";

        pool.query(
          "UPDATE general_results SET ? WHERE student_id = ? AND level_number = ?",
          [score, payload.student_id, payload.level_number],
          (error, general_result) => {
            if (general_result) {
              return callback("OK");
            } else {
              return callback("NO");
            }
          }
        );
      } else {
        pool.query(
          "INSERT INTO general_results SET ?",
          payload,
          (error, results) => {
            if (results) {
              return callback("YES");
            } else {
              return callback("NO");
            }
          }
        );
      }
    }
  );
}

// Deliveing the student result to database
function deliverResult(payload, callback) {
  pool.query(
    "SELECT * FROM general_results WHERE level_number = ? AND student_id = ?",
    [payload.level_number, payload.student_id],
    (error, general_result) => {
      console.log("Found1! : ", general_result);
      if (general_result.length > 0) {
        pool.query(
          "UPDATE general_results SET ? WHERE student_id = ? AND level_number = ?",
          [payload, payload.student_id, payload.level_number],
          (error, general_result) => {
            if (general_result) {
              return callback("YES");
            } else {
              return callback("NO");
            }
          }
        );
      } else {
        pool.query("INSERT INTO general_results SET ?", payload, (error, results) => {
          if (results) {
            console.log("Something Happened!1");
            return callback("YES");
          } else {
            console.log("Something Happened!2");
            return callback("NO");
          }
        });
      }
    }
  );
}

function calculateTime(time, callback) {
  // Code will locate here
}

// Track Student Answer
function student_score(
  task_id,
  answer,
  student_profile,
  time,
  teacher_profile,
  levelObject,
  page_count,
  callback
) {
  var answerPayload = {
    answer: answer,
    student_name: student_profile.firstname,
    time: time,
    teacher_name: teacher_profile.firstname,
    status: undefined,
    score: undefined,
    task_id: levelObject.task_id,
    level_number: levelObject.level_number,
    level_id: levelObject.level_id,
    student_id: student_profile.student_id
  };

  pool.query("SELECT * FROM tasks WHERE task_id = " + task_id + "", function (
    error,
    results
  ) {
    if (results.length > 0) {
      if (page_count != 9) {
        if (answer === results[0].correct_answer) {
          findAnswer(task_id, answer, function (answer_result) {
            point = results[0].points;
            answerPayload.answer = answer_result;
            answerPayload.status = "Passed";
            answerPayload.score = point;
            answerPayload.isEssay = 0;
            pool.query(
              "INSERT INTO student_scores SET ?",
              answerPayload,
              (error, student_score) => {
                if (student_score) {
                  return callback(student_score);
                } else {
                  return callback("Something went wrong");
                }
              }
            );
          });
        } else {
          // Find the answer and then check if he passed or not
          findAnswer(task_id, answer, function (answer_result) {
            answerPayload.answer = answer_result;
            answerPayload.status = "Failed";
            answerPayload.score = 0;
            answerPayload.isEssay = 0;
            pool.query(
              "INSERT INTO student_scores SET ?",
              answerPayload,
              (error, student_score) => {
                if (student_score) {
                  return callback(student_score);
                } else {
                  return callback("Something went wrong");
                }
              }
            );
          });
        }
      } else {
        answerPayload.answer = answer;
        answerPayload.status = "Pending";
        answerPayload.score = 0;
        answerPayload.isEssay = 1;
        pool.query(
          "INSERT INTO student_scores SET ?",
          answerPayload,
          (error, student_score) => {
            if (student_score) {
              return callback(student_score);
            } else {
              return callback("Something went wrong");
            }
          }
        );
      }
    } else {
      return callback("Something went wrong");
    }
  });
}

// Find the answer in text form
function findAnswer(task_id, answer, callback) {
  pool.query("SELECT * FROM tasks WHERE task_id = " + task_id + "", function (
    error,
    results
  ) {
    if (results.length > 0) {
      switch (answer) {
        case "1":
          return callback(results[0].first_answer);
          break;
        case "2":
          return callback(results[0].second_answer);
          break;
        case "3":
          return callback(results[0].third_answer);
          break;
        default:
          return callback("Empty");
          break;
      }
    } else {
      return callback("Empty");
    }
  });
}

module.exports = {
  answerTask: function (req, res) {
    var decodedToken = req.auth;
    var student_profile = req.user[0];
    var teacher_profile = req.studentTeacher[0]; // Get particular student's teacher profile infos

    var answer = {
      task_id: req.body.task_id,
      answer: req.body.answer || req.body.desc,
      level_id: req.body.level_id,
      level_number: req.body.level_number,
      student_id: decodedToken.id,
      time: req.body.time
    };

    checkAnswer(answer.task_id, answer.answer, function (point) {
      answer.point = point;
      console.log(answer);
      pool.query(
        "INSERT INTO student_answers SET ?",
        answer,
        (error, student) => {
          if (student) {
            student_score(
              answer.task_id,
              answer.answer,
              student_profile,
              answer.time,
              teacher_profile,
              answer,
              req.body.paper_count,
              function (data) {
                console.log("paper : !", req.body.paper_count);
                if (req.body.paper_count == 9) {
                  result_proc(
                    answer.level_id,
                    student_profile,
                    teacher_profile,
                    function (point) {
                      return res
                        .status(200)
                        .send(JSON.stringify({ status: 200, result: "OK" }));
                    }
                  );
                } else {
                  const payload = {
                    student_name: student_profile.firstname,
                    result: "failed",
                    time: answer.time,
                    teacher_name: teacher_profile.firstname,
                    score: answer.point,
                    level_id: answer.level_id,
                    published: "yes",
                    question_answered: answer,
                    level_number: answer.level_number,
                    student_id: answer.student_id
                  };
                  updateGeneralResults(payload, function (point) {
                    return res
                      .status(200)
                      .send(JSON.stringify({ status: 200, result: "OK" }));
                  });
                }
              }
            );
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
    });
  },
  getTaskID: function (req, res) {
    var decodedToken = req.auth;
    findUserClass(decodedToken.id, function (student) {
      findInstitution(
        "SELECT * FROM classes INNER JOIN school ON classes.school_id = school.school_id WHERE classes.class_id = ?",
        student[0].class_id,
        function (Institution) {
          pool.query(
            "SELECT * FROM levels INNER JOIN tasks ON levels.id = tasks.level_id WHERE levels.school_id = " +
            Institution[0].school_id +
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
      );
    });
  },
  getTaskByLevelID: function (req, res) {
    var decodedToken = req.auth;
    var body = req.body;
    findLevelNumber(decodedToken.id, function (levelNumber) {
      var levelNumber = levelNumber;
      findUserClass(decodedToken.id, function (student) {
        findInstitution(
          "SELECT * FROM classes INNER JOIN school ON classes.school_id = school.school_id WHERE classes.class_id = ?",
          student[0].class_id,
          function (Institution) {
            pool.query(
              "SELECT * FROM levels INNER JOIN tasks ON levels.id = tasks.level_id WHERE levels.school_id = " +
              Institution[0].school_id +
              " AND levels.level_number = " +
              levelNumber +
              " ORDER BY tasks.task_id",
              (error, results) => {
                if (results.length > 0) {
                  var result = results.chunk(9);
                  return res
                    .status(200)
                    .send(JSON.stringify({ status: 200, result: result }));
                } else {
                  return res.status(200).send(
                    JSON.stringify({
                      status: "There is no record",
                      result: []
                    })
                  );
                }
              }
            );
          }
        );
      });
    });
  },
  results: function (req, res) {
    var decodedToken = req.auth;
    var body = req.body;

    pool.query(
      "SELECT * FROM student_scores WHERE student_id = " +
      decodedToken.id +
      " AND level_number = " +
      body.level_number +
      " ",
      function (error, results) {
        if (results.length > 0) {
          return res
            .status(200)
            .send(JSON.stringify({ status: 200, result: results }));
        } else {
          return res
            .status(200)
            .send(JSON.stringify({ status: "There is no record", result: -1 }));
        }
      }
    );
  },
  giveEssayPoint: function (req, res) {
    var decodedToken = req.auth;
    var body = req.body;

    // Security Lines..
    pool.query(
      "SELECT * FROM student_scores WHERE student_id = " +
      body.student_id +
      " AND level_number = " +
      body.level_number +
      " AND isEssay = 1 ",
      function (error, results) {
        if (results.length > 0) {
          updateLastResult(
            results[0].student_score_id,
            body.point,
            body.student_id,
            body.level_number,
            function (result) {
              if (result === "OK") {
                return res
                  .status(200)
                  .send(JSON.stringify({ status: 200, result: "OK" }));
              } else {
                return res.status(200).send(
                  JSON.stringify({
                    status: "Something Went Wrong",
                    result: -1
                  })
                );
              }
            }
          );
        }
      }
    );
  }
};
