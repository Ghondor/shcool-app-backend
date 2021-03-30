
var reason = "";

module.exports = {
    online: function (req, res) {
        return res.status(200).send(JSON.stringify({ 'status': 200, 'result': 'API IS ON' }));
    },
    offline: function (req, res) {
        return res.status(200).send(JSON.stringify({ 'status': 200, 'result': 'API IS OFF', 'reason': reason }));
    }
}