var exports = module.exports = {};

exports.onLoad = function() {
    commands.add("!test", function(args) {
        console.log(args.join(" ")); 
    });
}