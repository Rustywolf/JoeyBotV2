var DNClient = require('./DNClient/DNClient.js');

var client = new DNClient("Roosty", "w1lliam");

client.on("message", function(message) {
    console.log("Msg: " + message[0]);
});

client.on("socketError", function(err) {
    console.log(err);
});

client.on("login", function(response) {
    client.connect();
});