var exports = module.exports = {};

exports.onLoad = function () {
    var exports = this;

    this.waitingOnRequest = false;
    this.historyRequests = [];

    global.commands.add("!history", function (args, message) {
        handleHistory(args, message, false);
    }, [global.config.channels.JoeyBotOffices]);

    global.commands.add("!bbhistory", function (args, message) {
        handleHistory(args, message, true);
    }, [global.config.channels.JoeyBotOffices]);


    function handleHistory(args, message, bb) {
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
                    ],
                    bb: bb
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

    }

    global.client.on('message', function (args) {
        if (args[0] == "Ban status") {

            var history = new UserHistory(args);
            var current = exports.historyRequests.shift();

            if (current.username != undefined) {
                var msgs = current.bb ? formatBBHistory(current, history) : formatHistory(current, history);

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

    function formatHistory(current, history) {
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
                    append += "<**System**> Blacklisted IP/Computer\n";
                } else {
                    //append += " • __" + message.note + "__ *by* **" + message.admin + "** - ";
                    append += "<**" + message.admin + "**> " + message.note + " - ";
                    if (message.time && message.time == "N/A") {
                        //append += "*Pre April 2016*\n";
                        append += "**Pre April 2012**\n";
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
                append == "Results unavailable past this point.";
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

        return msgs;
    }

    function formatBBHistory(current, history) {
        var msgs = [];

        var msg = "";
        current.requesters.forEach(function (requester) {
            msg += requester.mention() + ", ";
        });

        msg = msg.substring(0, msg.length - 2);
        msg += "\n";

        msg += "[b]Username:[/b] " + current.username + "\n";
        msg += "[b]Status:[/b] " + history.status + "\n";
        msg += "[b]Strikes:[/b] " + history.strikes + "\n";

        // This shit needs to be fixed
        var append = "\n";

        history.messages.forEach(function (message) {
            if (!message.truncated) {
                if (message.blacklisted) {
                    //append += " • __Blacklisted IP/Computer__ *by* **System**\n";
                    append += "<[b]System[/b]> Blacklisted IP/Computer\n";
                } else {
                    //append += " • __" + message.note + "__ *by* **" + message.admin + "** - ";
                    append += "<[b]" + message.admin + "[/b]> " + message.note + " - ";
                    if (message.time && message.time == "N/A") {
                        //append += "*Pre April 2016*\n";
                        append += "[b]Pre April 2012[/b]\n";
                    } else {
                        if (message.time) {
                            //append += "**" + message.time + "** - "
                            append += "[b]" + message.time + "[/b] - ";
                        }
                        //append += "*" + message.date + "*\n";
                        append += "" + message.date + "\n";
                    }
                }
            } else {
                //append += "*Results truncated past 10 entries*\n";
                append == "Results unavailable past this point.";
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

        return msgs;
    }
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

                    if (split.length > 2) {
                        var newSplit = [];
                        newSplit[1] = split[split.length-1];
                        var tmpSplit = "";
                        for (var i = 0; i < split.length-1; i++) {
                            tmpSplit += split[i] + "|";
                        }
                        
                        tmpSplit = tmpSplit.substr(0, tmpSplit.length-1);
                        newSplit[0] = tmpSplit;
                        
                        console.log(newSplit[0] + " : " + newSplit[1]);
                        split = newSplit;
                    }
                    
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