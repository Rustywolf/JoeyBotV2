var exports = module.exports = {
    config: require("./config.json")
};

exports.getAddonConfig = function (name) {
    if (exports.config.addonConfigs[name]) {
        return exports.config.addonConfigs[name];
    } else {
        return {};
    }
}

exports.getConfig = function() {
    return exports.config;
}