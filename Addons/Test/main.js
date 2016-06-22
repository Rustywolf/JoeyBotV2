var exports = module.exports = {};

exports.onLoad = function() {
    commands.add("!nohomo", function(args, message) {
        global.bot.reply(message, "https://en.wikipedia.org/wiki/No_homo");
    });
}