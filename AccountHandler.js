var exports = module.exports = function AccountHandler(client) {
    var exports = this;
    
    this.client = client;
    
    this.client.on('connect', function() {
        exports.changeState(DNStates.LOGGED_IN);    
    });
    
    this.client.on('disconnect', function() {
        
    });
    
    this.onLoggedOut = [];
    this.onLogIn = [];
    this.state = DNStates.LOGGED_OUT;

    this.onLogin = function (callback) {
        this.onLogIn.push(callback);
    }

    this.onLogout = function (callback) {
        this.onLoggedOut.push(callback);
    }

    this.changeState = function (state) {
        if (this.state == state) return;

        this.state = state;
        if (state == DNStates.LOGGED_IN) {
            this.onLogIn.forEach(function (callback) {
                callback();
            });

            this.onLogIn = [];
        } else if (state == DNStates.LOGGED_OUT) {
            this.onLoggedOut.forEach(function (callback) {
                callback();
            });

            this.onLoggedOut = [];
        }
    }
    
    this.waiting = {};

    this.handle = function (callback, key) {
        this.waiting[key] = new Date().getTime();
        if (this.state == DNStates.LOGGED_IN) {
            callback();
        } else {
            this.onLogin(callback);
            this.client.connect();
            this.changeState(DNStates.LOGGING_IN);
        }
    }
    
    this.waitingOn = function(key) {
        return (this.waiting[key] != undefined);
    }
    
    this.hasResolved = function(key) {
        delete this.waiting[key];
        this.checkIfResolved();
    }
    
    this.checkIfResolved = function() {
        if(Object.keys(this.waiting).length == 0) {
            exports.client.disconnect();
            exports.changeState(DNStates.LOGGED_OUT);
        }
    }
}
    
var DNStates = {
    LOGGED_OUT: "LOGGED_OUT",
    LOGGING_IN: "LOGGING_IN",
    LOGGED_IN: "LOGGED_IN"
};