module.exports = {
    adminAuthorization: function (req, res, next) {
        var bearerHeader = req.headers["authorization"];
        if (bearerHeader == null) {
            return res.status(401).send(JSON.stringify({ "Status": "Token is empty, make sure you're sending one or that you're authenticated." }));
        } else {
            jwt.verify(bearerHeader, 'secret', function (err, verify) {
                if (typeof verify === "undefined") {
                    return res.status(404).send(JSON.stringify({ "Status": "Invalid token" }));
                } else {
                    var decoded = jwt.decode(bearerHeader);
                    if (decoded.role === "A") {
                        req['auth'] = decoded;
                        next();
                    } else {
                        return res.status(401).send(JSON.stringify({ "Status": "Authorization Denied!" }));
                    }
                }
            });
        }

    }
}