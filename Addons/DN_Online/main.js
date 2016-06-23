var http = require('http');
var url = require('url');

var exports = module.exports = {};

exports.waiting = [];

exports.onLoad = function () {
    var exports = this;
    var config = this.config = global.configManager.getAddonConfig("DN_Online");

    this.admins = [];

    fetchAdminList(function (admins) {
        exports.admins = admins;
    });

    setInterval(function () {
        fetchAdminList(function (admins) {
            exports.admins = admins;
        });
    }, 1000 * 60 * 60 * 6);

    this.onlineAdmins = [];
    this.offdutyAdmins = [];
    this.onlineUsers = 0;
    this.calls = 0;

    global.commands.add("!online", function (args, message) {
        if (!message.author) return;

        exports.waiting.push(message);
        global.accountHandler.handle(function () {}, "online");
    }, [global.config.channels.JoeyBotOffices]);

    global.client.on('message', function (args) {
        if (args[0] == "Online users") {
            for (var i = 1; i < args.length; i += 2) {
                var name = args[i];
                var rank = args[i + 1];

                if (name == "JoeyBot") {
                    break;
                }

                if (rank > 0) {
                    exports.onlineAdmins.push(name);
                } else if (exports.admins.indexOf(name) != -1) {
                    exports.offdutyAdmins.push(name);
                }

                exports.onlineUsers++;
            }

            foundUsers = true;
            checkInformation()
        } else if (args[0] == "Add admin calls") {
            exports.calls = (args.length - 1) / 3;
            foundCalls = true;
            checkInformation()
        }
    });

    global.client.on('disconnect', function () {
        exports.onlineAdmins = [];
        exports.offdutyAdmins = [];
        exports.onlineUsers = 0;

        foundCalls = false;
        foundUsers = false;
    });
}

// https://gist.github.com/CatTail/4174511
var decodeHtmlEntity = function (str) {
    return str.replace(/&#(\d+);/g, function (match, dec) {
        return String.fromCharCode(dec);
    });
}

var regex = /<body>\n\n(.*?)\n<\/body>/gi;

function parseList(body) {
    var ret = regex.exec(body)[1];
    ret = ret.replace(/<br \/>/g, "\n");
    ret = decodeHtmlEntity(ret);
    ret = ret.replace(/^\s+|\s+$/g, "");

    regex.lastIndex = 0;
    return ret;
}

function fetchAdminList(callback) {
    var adminOptions = url.parse(exports.config.admins);
    adminOptions.port = 80;

    http.get(adminOptions, function (res) {
        res.setEncoding('utf8');

        var body = '';

        res.on('data', function (chunk) {
            body += chunk;
        }).on('end', function () {
            callback(parseList(body).split("\n"));
        }).on('error', function (err) {
            console.log("Error: " + err.message);
        });
    });
}

var foundUsers = false;
var foundCalls = false;

function checkInformation() {
    if (foundUsers && foundCalls) {
        printMessage();
    }
}

function printMessage() {
    var msg = "\n**Admins Online:** " + exports.onlineAdmins.length;
    if (exports.onlineAdmins.length > 0) {
        msg += " (";
        exports.onlineAdmins.forEach(function (admin) {
            msg += admin + ", ";
        });

        msg = msg.substring(0, msg.length - 2);
        msg += ")";
    }

    msg += "\n";
    msg += "**Admins Offduty:** " + exports.offdutyAdmins.length;
    if (exports.offdutyAdmins.length > 0) {
        msg += " (";
        exports.offdutyAdmins.forEach(function (admin) {
            msg += admin + ", ";
        });

        msg = msg.substring(0, msg.length - 2);
        msg += ")";
    }

    msg += "\n";
    msg += "**Users Online:** " + exports.onlineUsers;

    msg += "\n";
    msg += "**Calls Waiting:** " + exports.calls;

    exports.waiting.forEach(function (waiter) {
        global.bot.reply(waiter, msg);
    });

    exports.waiting = [];
    global.accountHandler.hasResolved("online");
}