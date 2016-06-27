var exports = module.exports = {};

exports.onLoad = function () {
    var exports = this;

    this.waitingOnRequest = false;
    this.historyRequests = [];

    global.commands.add("!history", function (args, message) {
        if (args.length < 1) return;

        var user = args.join(" ").toLowerCase();
        var requester = message.author;

        if (user == null || user == "") return;

        var waiting = exports.waitingOnRequest;
        if (!waiting) {
            exports.waitingOnRequest = true;
        }

        var callback = function () {
            var sendRequest = false;
            if (!waiting) {
                sendRequest = true;
            }
            var statusRequest = exports.historyRequests.find(function (request) {
                return request.username == user;
            });

            if (statusRequest == undefined) {
                statusRequest = {
                    username: user,
                    requesters: [
                        requester
                    ]
                };

                exports.historyRequests.push(statusRequest);
            } else {
                statusRequest.requesters.push(requester);
            }

            if (sendRequest) {
                global.client.send(["Ban status", user]);
            }
        }

        global.accountHandler.handle(callback, "history#" + user);

    }, [global.config.channels.JoeyBotOffices]);

    global.client.on('message', function (args) {
        if (args[0] == "Ban status") {

            var history = new UserHistory(args);
            var current = exports.historyRequests.shift();

            if (current.username != undefined) {
                var msgs = [];

                var msg = "";
                current.requesters.forEach(function (requester) {
                    msg += requester.mention() + ", ";
                });

                msg = msg.substring(0, msg.length - 2);
                msg += "\n";

                msg += "**Username:** " + current.username + "\n";
                msg += "**Status:** " + history.status + "\n";
                msg += "**Strikes:** " + history.strikes + "\n";
                
                // This shit needs to be fixed
                var append = "\n";

                history.messages.forEach(function (message) {
                    if (!message.truncated) {
                        if (message.blacklisted) {
                            //append += " • __Blacklisted IP/Computer__ *by* **System**\n";
                            append += "[**System**] Blacklisted IP/Computer";
                        } else {
                            //append += " • __" + message.note + "__ *by* **" + message.admin + "** - ";
                            append += "[**" + message.admin + "**] " + message.note + " - ";
                            if (message.time && message.time == "N/A") {
                                //append += "*Pre April 2016*\n";
                                append += "**Pre April 2012**";
                            } else {
                                if (message.time) {
                                    //append += "**" + message.time + "** - "
                                    append += "**" + message.time + "** - ";
                                }
                                //append += "*" + message.date + "*\n";
                                append += "" + message.date + "\n";
                            }
                        }
                    } else {
                        //append += "*Results truncated past 10 entries*\n";
                        append == "Results truncated past 10 entries\n";
                    }

                    if (append.length + msg.length >= 1997) {
                        msgs.push(msg);
                        msg = append;
                    } else {
                        msg += append;
                    }

                    append = "";
                });

                msgs.push(msg);

                msgs.forEach(function (msg, index) {
                    setTimeout(function () {
                        global.bot.sendMessage(global.config.channels.JoeyBotOffices, msg);
                    }, index * 200);
                });
            }

            if (exports.historyRequests.length > 0) {
                global.client.send(["Ban status", exports.historyRequests[0].username]);
            } else {
                exports.waitingOnRequest = false;
            }

            global.accountHandler.hasResolved("history#" + current.username);
        } else if (args[0] == "Error") {
            if (exports.historyRequests.length > 0) {
                var currentRequest = exports.historyRequests[0];
                if (args[1] == currentRequest.username + " is not a registered user") {
                    global.bot.sendMessage(global.config.channels.JoeyBotOffices, currentRequest.username + " is not a registered user!");
                    exports.historyRequests.shift();

                    if (exports.historyRequests.length > 0) {
                        global.client.send(["Ban status", exports.historyRequests[0].username]);
                    } else {
                        exports.waitingOnRequest = false;
                    }

                    global.accountHandler.hasResolved("history#" + currentRequest.username);
                }
            }
        }
    });
}

function UserHistory(data) {
    var history = this;

    this.status = data[1];
    this.strikes = data[2];
    this.messages = [];

    var messagesArray = data[3].split("\n");
    var regex = /(\|+?)(.*?)GMT/g;
    messagesArray.every(function (message, index) {
        if (message == "") return;

        var messageObj;
        regex.lastIndex = 0;
        if ((!regex.test(message) && data[3].length == 10000 && index == messageArray.length - 1 && message !== "Blacklisted IP/Computer")) {
            messageObj = {
                truncated: true
            }
        } else {
            if (message === "Blacklisted IP/Computer") {
                messageObj = {
                    blacklisted: true
                }
            } else {
                regex.lastIndex = 0;
                if (regex.test(message)) {
                    var split = message.split(/\|+/);

                    var date = split[1].trim();
                    var time = false;
                    if (date.indexOf("\\,") != -1) {
                        var dateSplit = date.split("\\,");
                        var date = dateSplit[0].trim();
                        var time = dateSplit[1].trim();
                    }

                    var noteSplitBy = (!time && !message.startsWith("Duel Note (")) ? " by " : " - ";
                    var note = split[0].trim();
                    var noteSplit = note.split(noteSplitBy);
                    var admin = noteSplit.pop().trim();
                    var note = noteSplit.join(noteSplitBy).trim();

                    messageObj = {
                        note: note,
                        admin: admin,
                        date: date,
                        time: time
                    };
                } else {
                    var noteSplitBy = " - ";
                    var note = message.trim();
                    var noteSplit = note.split(noteSplitBy);
                    var admin = noteSplit.pop().trim();
                    var note = noteSplit.join(noteSplitBy).trim();

                    messageObj = {
                        note: note,
                        admin: admin,
                        date: "N/A",
                        time: "N/A"
                    };

                }
            }
        }

        history.messages.push(messageObj);

        if (messageObj.truncated) {
            return false;
        } else {
            return true;
        }
    });
}