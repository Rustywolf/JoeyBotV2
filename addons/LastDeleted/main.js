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
    
    global.commands.add("!shitpost", function(args, message) {
       if (message.author && message.author.id == "96880206836424704") {
            bot.sendMessage(message, "\uD83D\uDC4C\uD83D\uDC40\uD83D\uDC4C\uD83D\uDC40\uD83D\uDC4C\uD83D\uDC40\uD83D\uDC4C\uD83D\uDC40\uD83D\uDC4C\uD83D\uDC40 good shit go\u0C66\u0501 sHit\uD83D\uDC4C thats \u2714 some good\uD83D\uDC4C\uD83D\uDC4Cshit right\uD83D\uDC4C\uD83D\uDC4Cthere\uD83D\uDC4C\uD83D\uDC4C\uD83D\uDC4C right\u2714there \u2714\u2714if i do \u01BDa\u04AF so my self \uD83D\uDCAF i say so \uD83D\uDCAF thats what im talking about right there right there (chorus: \u02B3\u1DA6\u1D4D\u02B0\u1D57 \u1D57\u02B0\u1D49\u02B3\u1D49) mMMMM\u13B7\u041C\uD83D\uDCAF \uD83D\uDC4C\uD83D\uDC4C \uD83D\uDC4C\u041DO0\u041E\u0B20OOOOO\u041E\u0B20\u0B20Oooo\u1D52\u1D52\u1D52\u1D52\u1D52\u1D52\u1D52\u1D52\u1D52\uD83D\uDC4C \uD83D\uDC4C\uD83D\uDC4C \uD83D\uDC4C \uD83D\uDCAF \uD83D\uDC4C \uD83D\uDC40 \uD83D\uDC40 \uD83D\uDC40 \uD83D\uDC4C\uD83D\uDC4CGood shit");
       } 
    });
}