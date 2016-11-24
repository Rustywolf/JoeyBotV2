var exports = module.exports = {};

exports.onLoad = function() {
    commands.add("!nohomo", function(args, message) {
        message.reply("https://en.wikipedia.org/wiki/No_homo");
    });
}