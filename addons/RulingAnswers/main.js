var exports = module.exports = {};

var http = require("http");
var Reddit = require("raw.js");
var reddit = new Reddit("RegionBlockBot v1.0.1 by /u/Rustywolf");

var discordId = "95620328654376960"; //"95620328654376960";
var password = "_`HS-W<'5PCjk5/3";
var authenticated = false;
var requestUsers = [];

function authenticate() {
    reddit.setupOAuth2("9ol1ZUQ8eQuKpg", "ztGKHqMrN1ST4BJaRfYfexMbI7k");
    reddit.auth({
        username: "RegionBlockBot",
        password: password
    }, function (err, response) {
        if (err) {
            console.log("Unable to authenticate Reddit!");
            setTimeout(authenticate, 1000 * 30);
        } else {
            console.log("Authenticated!");
            authenticated = true;

            if (requestUsers.length != 0) {
                processPosts();
            }
        }
    });
}

authenticate();

exports.onLoad = function () {
    global.commands.add("!rulingscount", function (args, message) {
        if (message.channel && message.channel.server && message.channel.server.id == discordId) {
            if (args.length > 0) {
                var request = {
                    author: message.author,
                    channel: message.channel,
                    user: args[0]
                };

                message.reply("Adding " + args[0] + " to queue!");

                var process = requestUsers.length == 0;
                requestUsers.push(request);
                if (process) {
                    processPosts();
                }
            } else {
                message.reply("Please specify a user");
            }
        }
    });
};

function processPosts() {
    var posts = [];
    var interval = -1;
    var request = requestUsers.shift();
    var processed = false;

    var callback = (function () {
        var count = 0;
        var last = "";
        return function () {
            console.log("Retrieving page #" + count / 100);
            reddit.userComments({
                user: request.user,
                count: count,
                after: last,
                limit: 100
            }, function (err, response) {
                if (err) {
                    console.log(err);
                } else {
                    response.children.forEach(function (child) {
                        var data = child.data;
                        if (data.parent_id !== data.link_id &&
                            (data.link_title.indexOf("Ruling Megathread") != -1 ||
                                data.link_title.indexOf("Basic and Newbie Q&A Thread") != -1 ||
                                data.link_title.indexOf("Rulings Q&A Thread") != -1)
                        ) {
                            posts.push({
                                articleId: data.link_id.split("_")[1],
                                parentId: data.parent_id.split("_")[1],
                                commentId: data.id,
                                url: data.link_url
                            });
                        }

                        last = data.name;
                    });

                    if (response.children.length < 100 || count >= 25000 && !processed) {
                        processed = true;
                        clearInterval(interval);
                        var results = [];
                        posts.forEach(function (post, index) {
                            setTimeout(function () {
                                var url = `http://www.reddit.com/r/yugioh/comments/${post.articleId}.json?comment=${post.parentId}&limit=1`;
                                http.get(url, function (res) {
                                    var body = "";
                                    res.on("data", function (data) {
                                        body += data;
                                    });

                                    res.on("end", function () {
                                        if (body.charAt(0) == "<") {
                                            console.log("Error processing " + url);
                                        } else {
                                            var response = JSON.parse(body);
                                            response.forEach(function (comment) {
                                                var data = comment.data.children[0].data;
                                                if (data.id === post.parentId) {
                                                    if (data.parent_id === data.link_id) {
                                                        results.push("" + post.url + post.commentId);
                                                    }
                                                    
                                                    console.log(index + "/" + posts.length);
                                                    if (index >= posts.length - 1) {
                                                        printResults(request, results);

                                                        if (requestUsers.length != 0) {
                                                            processPosts();
                                                        }
                                                    }
                                                }
                                            });
                                        }
                                    });
                                }).on("error", function (err) {
                                    console.log(err);
                                });
                            }, 2000 * index);
                        });
                    }
                }
            });

            count += 100;
        }
    })();

    interval = setInterval(callback, 1000);
    callback();
}

function printResults(request, results) {
    var msgs = [];
    var msg = "Count: **" + results.length + "**\n";
    results.forEach(function (result) {
        if (msg.length + result.length > 1950) {
            msgs.push(msg);
            msg = result;
        } else {
            msg += result + "\n";
        }
    });

    msgs.push(msg);

    global.bot.user.sendMessage(request.channel, request.author.mention());
    msgs.forEach(function (msg, index) {
        setTimeout(function () {
            global.bot.user.sendMessage(request.channel, msg);
        }, 250 * index);
    });
}