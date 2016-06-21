var events = require('events');
var http = require('http');

var InternalClient = require('./InternalClient.js');

var exports = module.exports = function DNClient(username, password) {
    events.EventEmitter.call(this);
    var client = this;

    this.failedLogin = false;
    this.internal = null;
    this.username = null;
    this.loginToken = null;

    this.connected = function () {
        return this.internal != null;
    }

    this.disconnect = function () {
        if (this.internal != null) {
            this.internal.disconnect();
            this.internal.removeAllListeners();
            this.emit("logout");
            this.internal = null;
        } else {
            throw new Error("Attempted to log out while not logged in!");
        }
    }

    this.connect = function () {
        this.internal = new InternalClient(this.username, this.loginToken);

        this.internal.on("connect", function () {
            client.emit("connect");
        });

        this.internal.on("disconnect", function () {
            client.emit("disconnect");
        });

        this.internal.on("socketEnd", function () {
            client.emit("socketEnd");
        });

        this.internal.on("socketError", function (err) {
            client.emit("socketError", err);
        });

        this.internal.on("message", function (message) {
            // TODO: Parse this shit and make each message it's own event
            client.emit("message", splitMessage(message));
        });

        this.internal.connect();
    };

    login(username, password, function (response) {
        client.username = response.username;
        client.loginToken = response.loginToken;
        client.emit("login", response);
    }, function (error) {
        client.failedLogin = true;
        client.emit("error", error);
    });
};

exports.prototype.__proto__ = events.EventEmitter.prototype;

function login(username, password, callback, error) {
    var query = "username=" + username + "&password=" + password + "&remember_me=false&dn_id=cafebabecafebabecafebabecafebabe";

    var options = {
        host: "duel.duelingnetwork.com",
        port: 8080,
        path: "/Dueling_Network/login.do",
        method: "POST",
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(query)
        }
    };

    var req = http.request(options, function (res) {
        res.setEncoding('utf8');

        var body = '';

        res.on('data', function (chunk) {
            body += chunk;
        }).on('end', function () {
            var response = body.split(",");

            if (response.length <= 0 || response[0] == "Error") {
                error(response[1]);
            } else {
                var obj = {
                    response: response[0],
                    username: response[1],
                    loginToken: response[2],
                    rememberMe: response[3]
                }

                callback(obj);
            }
        }).on('error', function (err) {
            console.log("Error: " + err.message);
        });
    });

    req.on("error", function (err) {
        console.log("Error: " + err.message);
    });

    req.write(query);
    req.end();
}

function splitMessage(message) {
    var results = [];
    var string = "";
    var escaped = false;

    for (var i = 0; i < message.length; i++) {
        var charAt = message.charAt(i);
        if (charAt == ",") {
            if (escaped) {
                string += "\\,";
                escaped = false;
            } else {
                results.push(string);
                string = "";
            }
        } else if (charAt == "\\") {
            if (escaped) {
                string += "\\\\";
                escaped = false;
            } else {
                escaped = true;
            }
        } else {
            string += charAt;
        }
    }

    results.push(string);
    return results;
}