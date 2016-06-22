var exports = module.exports = function Commands() {
    var commands = this;
    this.commands = {};
    this.commandChannels = {};

    this.add = function (command, callback, channels) {
        this.commands[command] = callback;
        if (channels) {
            this.commandChannels[command] = channels;
        }
    }

    this.handle = function (command, args, message) {
        if (this.commands[command]) {
            if (this.commandChannels[command]) {

                this.commandChannels[command].find(function (channel) {
                    if (channel === message.channel.id) {
                        commands.commands[command](args, message);
                        return true;
                    }

                    return false;
                });
            } else {
                this.commands[command](args, message);
            }
        }
    }
}