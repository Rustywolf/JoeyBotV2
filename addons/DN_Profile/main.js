var exports = module.exports = {};

exports.onLoad = function () {
    var exports = this;

    this.profileRequests = {};

    global.commands.add("!profile", function (args, message) {
        var requester = message.author;
        var user = args.join(" ").toLowerCase();

        if (user == null || user == "") return;

        var callback = function () {
            global.client.send(["Get profile", user]);

            if (exports.profileRequests[user] == undefined) {
                exports.profileRequests[user] = [];
            }

            exports.profileRequests[user].push(requester);
        }

        global.accountHandler.handle(callback, "profile#" + user);
    }, [global.config.channels.JoeyBotOffices]);

    global.client.on("message", function (args) {
        if (args[0] == "Get profile") {
            var profile = new UserProfile(args);
            if (exports.profileRequests[profile.username.toLowerCase()] != undefined) {
                var msg = "";
                exports.profileRequests[profile.username.toLowerCase()].forEach(function (requester) {
                    msg += requester.mention() + ", ";
                });

                msg = msg.substring(0, msg.length - 2);
                msg += "\n";
                msg += "**Username:** " + profile.username + "\n";
                msg += "**Match Results:** " + profile.matchesWins + "/" + profile.matchesLoses + " (**Rating:** " + profile.matchesRating + ")\n";
                msg += "**Singles Results:** " + profile.singlesWins + "/" + profile.singlesLoses + "/" + profile.singlesDraws + " (**Rating:** " + profile.singlesRating + ")\n";

                var date = new Date(Date.now() - profile.dateCreated * 1000);
                msg += "**Registered:** ";
                msg += ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][date.getUTCMonth()] + " " + date.getDate() + ", " + date.getFullYear() + "\n";

                msg += "**Status:** " + profile.online + "\n";
                msg += "**Last Online:** " + profile.lastOnline;
                
                global.bot.sendMessage(global.config.channels.JoeyBotOffices, msg);

                delete exports.profileRequests[profile.username.toLowerCase()];

                global.accountHandler.hasResolved("profile#" + profile.username.toLowerCase());
            }
        }
    });

    global.client.on("message", function (args) {
        if (args[0] == "Error") {
            var splt = args[1].split(" is not a registered user");
            if (splt.length >= 1) {
                var username = splt[0].toLowerCase();
                if (exports.profileRequests[username] != undefined) {
                    global.bot.sendMessage(global.config.channels.JoeyBotOffices, username + " is not a registered user!");
                    delete exports.profileRequests[username];
                    global.accountHandler.hasResolved("profile#" + profile.username.toLowerCase());
                }
            }
        }
    })
}

function UserProfile(data) {
    this.username = data[1];
    this.avatar = data[2];
    this.online = data[3];
    this.lastOnline = data[4];
    this.dateCreated = data[5];
    this.singlesRating = data[6];
    this.matchesRating = data[7];
    this.singlesWins = data[8];
    this.matchesWins = data[9];
    this.singlesLoses = data[10];
    this.matchesLoses = data[11];
    this.singlesDraws = data[12];
    this.matchesDraws = data[13];
    this.description = data[14];
    this.inDuel = data[15];
    this.donator = data[16];
}