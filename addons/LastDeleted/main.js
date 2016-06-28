var exports = module.exports = {};

var lastMessage = {};
var lastUpdate = {};

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
    
    global.bot.on('messageUpdated', function(message, newMessage) {
        if (message && message.author && message.channel) {
            update = {
                author: message.author.username,
                message: message.content
            };
            
            lastUpdate[message.channel.id] = update;
        }
    });

    global.commands.add("!replay", function(args, message) {
        if (message.channel && lastMessage[message.channel.id] != undefined) {
            var last = lastMessage[message.channel.id];
            bot.reply(message, "\n**" + last.author + "** said:\n" + last.message);
        } 
    });

    global.commands.add("!unedit", function(args, message) {
        if (message.channel && lastUpdate[message.channel.id] != undefined) {
            var update = lastUpdate[message.channel.id];
            bot.reply(message, "\n**" + update.author + "** originally said:\n" + update.message);
        } 
    });
}