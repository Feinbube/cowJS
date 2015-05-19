function Timer() {

    function Event(time, callback) {
        this.time = time;
        this.callback = callback;
        this.occured = false;

        this.fire = function() {
            if(!this.occured && this.time >= Date.now) {
                this.occured = true;
                callback();
            }
        };
    }

    var events = new Array();

    this.register = function(seconds, callback) {
        events.push(new Event(Date.now + seconds, callback));
    };

    var getLivingEvents = function() {
        var result = new Array();
        events.forEach( function(event){ if(!event.occured){ result.push(event); } });
        return result;
    }

    this.update = function() {
        events.forEach( function(event){ event.fire(); });
        events = getLivingEvents();
    };
}