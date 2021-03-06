var Card = require('./Card.js');
var database = require('./Database.js');
var Response = require('./Response.js');

var exports = module.exports = {};

var MESSAGE_REGEX = /{(.*?)}/g;

exports.onLoad = function () {
    var exports = this;
    var config = exports.config = global.configManager.getAddonConfig("CardSearch");
    
    global.bot.on('message', function (message) {

        if (message.author) {
            if (bot.user.id === message.author.id) {
                return;
            }
        }
        
        //if (!message.author || !message.author.id == "96880206836424704") return; // Locks it to Rustywolf

        var result = "";
        var results = [];

        while ((result = MESSAGE_REGEX.exec(message.content))) {
            results.push(result);
        }

        if (results.length > exports.config.card_limit_per_message) {
            message.reply("Nyeh? are ya tryin' to kill me? (" + exports.config.card_limit_per_message + " cards per message)");
            return;
        }

        var searches = [];
        var response = new Response(function (text) {
            message.reply(text);
        }, results.length);

        results.forEach(function (val) {
            var cardName = val[1];
            if (searches.indexOf(cardName) != -1) {
                return;
            }

            searches.push(cardName);

            console.log("Processing: " + cardName);
            database.lookup(cardName, function (card) {
                response.handle(card);
            });
        });
    });
}