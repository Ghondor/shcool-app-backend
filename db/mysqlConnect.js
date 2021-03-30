
var mysqlPoolConnection = new Promise(function (resolve, reject) {
    var poolConfig = require('../config/mysql');
    global.pool = new mysql.createPool(poolConfig);
    // pool.getConnection(function (err, connection) {
    //     if (err == null) reject();
    //     resolve();
    // });
    pool.getConnection((err, connection) => {
        if (err) reject(err); // not connected!

        // Use the connection
        connection.query('SELECT * FROM students', function (error, results) {
            // When done with the connection, release it.
            connection.release();

            // Handle error after the release.
            if (error) reject(error);
            resolve();

            // Don't use the connection here, it has been returned to the pool.
        });
    });
});


module.exports = mysqlPoolConnection;