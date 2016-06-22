var configManager = global.configManager = require('./config.js');
var config = global.config = require('./config.json');

var AccountHandler = require('./AccountHandler.js');
var Commands = require('./Commands.js');
var Discord = require('discord.js');
var DNClient = require('./DNClient/DNClient.js');



/**
 * DN Client
 **/

var client = global.client = new DNClient(config.dn.username, config.dn.password, true);
var accountHandler = global.accountHandler = new AccountHandler(client);



/**
 * Discord.js
 **/

var bot = global.bot = new Discord.Client({
    autoReconnect: true
});

if (config.login.token) {
    bot.loginWithToken(config.login.token);
} else {
    bot.login(config.login.email, config.login.password);
}

var commands = global.commands = new Commands();

bot.on('message', function (message) {
    if (!message.content) return;
    if (!message.channel.server) return;

    if (message.author) {
        if (bot.user.id === message.author.id) {
            return;
        }
    }

    var args = message.content.split(" ");
    var command = args.shift();

    commands.handle(command, args, message);
});



/**
 * Addons
 **/

this.addons = global.addons = {};
if (config.addons && config.addons.length > 0) {

    var addonsArray = [];
    config.addons.forEach(function (addon) {
        var addonObj = require("./addons/" + addon + "/main.js");
        addons[addon] = addonObj;
        addonsArray.push(addonObj);
    });

    addonsArray.forEach(function (addon) {
        if (typeof addon.onLoad == "function") {
            addon.onLoad();
        }
    });
}