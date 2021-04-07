
/**
    * Project:           School App
    * Description:       Backend Service
    * Environment :      Production
    * Version:           1.0.0
*/

// CORE LIBS
var reqs = require('./config/requirements.js');
var express = require('express');
var app = express();

// MIDDLEWARE BODY PARSER SETUP
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "X-Requested-With,content-type, Authorization, Cache-Control");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Content-Type", "application/x-www-form-urlencoded");
    next();
});

// SET ENV
app.use(morgan('dev'));

var router = express.Router();

// Main Route - Root
app.use('/', router);

// Routes
var status = require('./routes/status');
var auth = require('./routes/auth');
var user = require('./routes/user');
var classes = require('./routes/class');
var levels = require('./routes/levels');
var students = require('./routes/student');
var admins = require('./routes/admins');
var internship = require('./routes/internship');
var results = require('./routes/results');
var report = require('./routes/report');

//Helper
var findUser = require('./helpers/findUser');
var teacherPermission = require('./helpers/teacherPermission');

//Super Admin Permission
var adminPermission = require('./helpers/adminPermission');

//Students Permission
var studentPermission = require('./helpers/studentPermission');

// SSL Request Route
router.get('/.well-known/acme-challenge/:filename', function (req, res) {
    var filename = req.params.filename;
    res.sendFile(__dirname + '/' + filename);
});

//Init Mysql
mysqlPoolConnection.then(() => {

    // API CORE //
    router.post('/status', status.online); // API IS ONLINE

    // Student //
    router.post('/login', auth.login);
    router.get('/profile', auth.isAuthed, user.profile);
    router.post('/student/profileUpdate', auth.isAuthed, studentPermission.studentAuthorization, user.studentProfileUpdate); // Student Get Tasks by Level ID
    router.post('/student/studentPictureUpdate', auth.isAuthed, studentPermission.studentAuthorization, user.studentPictureUpdate); // Student Picture Update
    router.post('/student/getTaskByLevelID', auth.isAuthed, studentPermission.studentAuthorization, students.getTaskByLevelID); // Student Get Tasks by Level ID
    router.post('/student/answerTask', auth.isAuthed, findUser.findStudent, students.answerTask); // Student Answer
    router.post('/student/results', auth.isAuthed, findUser.findStudent, students.results); // Student Answer

    // Teacher //
    router.post('/teacher/studentList', auth.isAuthed, teacherPermission.teacherAuthorization, user.studentList); // Student List
    router.post('/teacher/studentCreate', auth.isAuthed, teacherPermission.teacherAuthorization, user.studentCreate);  // Create Student
    router.post('/teacher/teacherList', auth.isAuthed, teacherPermission.teacherAuthorization, user.teacherList);  // Teacher List
    router.post('/teacher/profile', auth.isAuthed, teacherPermission.teacherAuthorization, user.teacherProfile); // Teacher Profile
    router.post('/teacher/editProfile', auth.isAuthed, teacherPermission.teacherAuthorization, user.teacherEditProfile); // Teacher Edit Profile
    router.post('/teacher/uploadProfilePicture', auth.isAuthed, teacherPermission.teacherAuthorization, user.profilePicture); // Teacher Profile Picture
    router.post('/teacher/classCreate', auth.isAuthed, teacherPermission.teacherAuthorization, classes.create);  // Create Class //
    router.post('/teacher/classList', auth.isAuthed, teacherPermission.teacherAuthorization, findUser.findTeacher, classes.getList);  // Classes List
    router.post('/teacher/singleClass/:id', auth.isAuthed, teacherPermission.teacherAuthorization, classes.getClass);  // GET Single Class
    router.post('/teacher/levelCreate', auth.isAuthed, teacherPermission.teacherAuthorization, findUser.findTeacher, levels.create); // Create Level //
    router.post('/teacher/singleTask', auth.isAuthed, teacherPermission.teacherAuthorization, findUser.findTeacher, levels.getTaskByID); // Update Task //
    router.post('/teacher/taskUpdate', auth.isAuthed, teacherPermission.teacherAuthorization, findUser.findTeacher, levels.taskUpdate); // Update Task //
    router.post('/teacher/levelCount', auth.isAuthed, teacherPermission.teacherAuthorization, findUser.findTeacher, levels.getSchoolLevelCount);
    router.post('/teacher/levelList', auth.isAuthed, teacherPermission.teacherAuthorization, findUser.findTeacher, levels.getLevelList); // Get Level Lists
    router.post('/teacher/companyCreate', auth.isAuthed, teacherPermission.teacherAuthorization, findUser.findTeacher, user.companyCreate); //Teacher Company
    router.post('/teacher/companyList', auth.isAuthed, teacherPermission.teacherAuthorization, findUser.findTeacher, user.companyList); // Get Company Lists
    router.post('/teacher/internshipCreate', auth.isAuthed, teacherPermission.teacherAuthorization, findUser.findTeacher, internship.createInternShip); //Internships
    router.post('/teacher/internship_list', auth.isAuthed, teacherPermission.teacherAuthorization, findUser.findTeacher, internship.getInternShip); // Get Internships

    router.post('/teacher/reportList', auth.isAuthed, teacherPermission.teacherAuthorization, findUser.findTeacher, report.getReports); // Get Internships
    router.post('/teacher/results', auth.isAuthed, teacherPermission.teacherAuthorization, findUser.findTeacher, results.getResults); // Get List Results of Students
    router.post('/teacher/getStudentAnswers', auth.isAuthed, teacherPermission.teacherAuthorization, findUser.findTeacher, results.getCurrentStudentResults); // Get List Results of Students
    
    router.post('/teacher/getEssay', auth.isAuthed, teacherPermission.teacherAuthorization, findUser.findTeacher, results.getCurrentStudentEssay); // Get List Results of Students
    router.post('/teacher/giveEssayPoint', auth.isAuthed, teacherPermission.teacherAuthorization, findUser.findTeacher, students.giveEssayPoint); // Get List Results of Students

    router.post('/teacher/readEssay', auth.isAuthed, teacherPermission.teacherAuthorization, findUser.findTeacher, user.teacherReadEssay); // Read Essay
    router.post('/teacher/updateEssayScore', auth.isAuthed, teacherPermission.teacherAuthorization, findUser.findTeacher, user.teacherUpdateScoreForEssay); // Update Essay
    router.post('/teacher/reportCreate', auth.isAuthed, teacherPermission.teacherAuthorization, findUser.findTeacher, report.reportCreate); // Create Report Save in Database
    router.post('/teacher/checkPermission', auth.isAuthed, teacherPermission.teacherAuthorization, findUser.findTeacher, user.teacherPermission); // Check in Levels and Report

    // Admins //
    router.post('/superadmin/profile', auth.isAuthed, adminPermission.adminAuthorization, admins.profile); // Get Admin Profile
    router.post('/superadmin/editProfile', auth.isAuthed, adminPermission.adminAuthorization, admins.edit); // Edit Admin Profile
    router.post('/superadmin/uploadProfilePicture', auth.isAuthed, adminPermission.adminAuthorization, admins.profilePicture); // Upload Profile Picture
    router.post('/superadmin/teacherCreate', auth.isAuthed, adminPermission.adminAuthorization, admins.teacherCreate); // Create Teacher
    router.post('/superadmin/teacherList', auth.isAuthed, adminPermission.adminAuthorization, admins.teacherList); // Get Teacher List

}).catch((err) => {
    router.post('/status', status.offline); // API IS OFFLINE
    console.log(err, "Please check your mysql connection!"); // MYSQL ERROR HANDLER
});

// Broadcasting
var port = process.env.PORT || 3500;
http.createServer(app).listen(port);
console.log("Production Level API is running on PORT : ", port);
