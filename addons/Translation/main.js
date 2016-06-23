var https = require('https');

var exports = module.exports = {};

exports.onLoad = function () {
    var exports = this;
    var config = global.configManager.getAddonConfig("Translation");
    
    global.commands.add("!translate", function (args, message) {
        var text = args.join(" ");
        if (text == "" || text == undefined) return;

        var query = "key=" + config.key + "&text=" + text + "&lang=en";

        var options = {
            host: "translate.yandex.net",
            port: 443,
            path: "/api/v1.5/tr.json/translate",
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(query)
            }
        };

        var req = https.request(options, function (res) {
            res.setEncoding('utf8');

            var body = '';

            res.on('data', function (chunk) {
                body += chunk;
            }).on('end', function () {
                var response = JSON.parse(body);
                
                global.bot.reply(message, "\nTranslation: " + response.text);
            }).on('error', function (err) {
                console.log("Error: " + err.message);
            });
        });

        req.on("error", function (err) {
            console.log("Error: " + err.message);
        });

        req.write(query);
        req.end();

    });
}