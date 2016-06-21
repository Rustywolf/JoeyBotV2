var events = require('events');
var net = require('net');

var DN_VERSION = "Connect23";

var exports = module.exports = function InternalClient(username, loginToken) {
    events.EventEmitter.call(this);
    var internal = this;

    this.username = username;
    this.loginToken = loginToken;
    this.session = randomHex(32);
    this.socket = null;

    this.send = function (args) {
        var message = args.join(",");
        this.socket.write(message + "\0");
    }

    this.heartbeat = -1;
    this.startHeartbeat = function () {
        this.heartbeat = setInterval(function () {
            internal.send(["Heartbeat"]);
        }, 25000);
    }

    this.stopHeartbeat = function () {
        if (this.heartbeat != -1) {
            clearInterval(this.heartbeat);
            this.heartbeat = -1;
        }
    }

    this.connect = function () {
        this.socket = net.createConnection({
            host: "duelingnetwork.com",
            port: "1234"
        }, function () {
            internal.send([DN_VERSION, internal.username, internal.loginToken, internal.session]); //, "Administrate"]);
            internal.startHeartbeat();
            internal.emit("connect");
        });

        this.socket.on('data', function (data) {
            this.buffer += data;

            if (this.buffer.indexOf("\0" != -1)) {
                var messages = this.buffer.split("\0");
                for (var i = 0; i < messages.length - 1; i++) {
                    internal.emit("message", messages[i]);
                }

                this.buffer = messages[messages.length - 1];
            }
        });

        this.socket.on('end', function () {
            internal.emit("socketEnd");
        });

        this.socket.on('error', function (err) {
            internal.emit("socketError");
        });

        this.socket.on('close', function () {
            internal.stopHeartbeat();
            internal.emit("disconnect");
        });
    }

    this.disconnect = function () {
        this.stopHeartbeat();
        this.socket.end();
    }

}

exports.prototype.__proto__ = events.EventEmitter.prototype;

function randomHex(length) {
    var ret = "";
    var hex = "abcdef0123456789";
    for (var i = 0; i < length; i++)
        ret += hex.charAt(Math.floor(Math.random() * hex.length));
    return ret;
}