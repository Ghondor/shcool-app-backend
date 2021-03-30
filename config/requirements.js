// CORE PACKAGES

global.mysql = require('mysql');
global.mysqlPoolConnection = require('../db/mysqlConnect');
global.path = require('path');
global.https = require('https');
global.http = require('http');
global.fs = require('fs');
global.serveIndex = require('serve-index')
global.bodyParser = require('body-parser');
global.Multer = require('multer');
global.format = require('util').format;
global.util = require('util');
global.getIP = require('ipware')().get_ip;
global.morgan = require('morgan');
global.swaggerUI = require('swagger-ui-express');
global.jwt = require('jsonwebtoken');
global.mongoose = require('mongoose');
global.sha256 = require('sha256');
global.md5 = require('md5');