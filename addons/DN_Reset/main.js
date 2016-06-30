var exports = module.exports = {};

exports.onLoad = function () {
    global.commands.add("!reset", function (args, message) {
        console.log((message.username ? message.username : "null") + " used !reset");
        global.accountHandler.waiting = {};
        global.accountHandler.checkIfResolved();
        global.bot.reply(message, "JoeyBot has been reset!");
    }, [global.config.channels.JoeyBotOffices]);

    global.commands.add("!break", function (args, message) {
        if (!message.author || !message.author.id == "96880206836424704") {
            global.bot.reply(message, "Shoo! Bad admin!");
            return; // Locks it to Rustywolf
        }
        
        global.accountHandler.handle(function() {}, "break");
    }, [global.config.channels.JoeyBotOffices]);
}