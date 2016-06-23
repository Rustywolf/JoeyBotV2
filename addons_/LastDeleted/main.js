var exports = module.exports = {};

var lastMessage = {};

exports.onLoad = function () {
    global.bot.on('messageDeleted', function (message, channel) {
        if (message && message.author ) {
            last = {
                author: message.author.username,
                message: message.content
            };
            
            lastMessage[channel.id] = last;
        }
    });

    global.commands.add("!replay", function(args, message) {
        if (message.channel && lastMessage[message.channel.id] != undefined) {
            var last = lastMessage[message.channel.id];
            bot.reply(message, "\n**" + last.author + "** said:\n" + last.message);
        } 
    });
}