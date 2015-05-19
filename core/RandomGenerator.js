
function RandomGenerator( seed ){

    this.x = 123456789;
    this.y = 362436069;
    this.z = 521288629;
    this.w = seed || 88675123;

    this.rnd = function() {

        var t = ( this.x ^ (this.x << 11) ) & 0x7fffffff;
        
        this.x = this.y;
        this.y = this.z;
        this.z = this.w;
        
        this.w = ( this.w ^ (this.w >> 19) ^ ( t ^ ( t >> 8 )) );
        
        return this.w / (0x7fffffff);
    };

    this.setSeed = function( seed ) {
        this.w = seed;
    };

    this.rndLong = function() {
        this.rnd();
        return this.w;
    };

    this.rndInt = function(min, max) {
        return Math.floor(min + this.rnd() * (max - min + 1));
    }

    this.selfTest = function() {
        var runTest = function(rnd, low, high, margin) {
            var min = 100000;
            var max = -min;
            for(var i = 0; i<10000; i++) {
                var v = rnd();
                min = v < min ? v : min;
                max = v > max ? v : max;
            }
            console.log('RandomGenerator.selfTest():');
            console.log('  min=' + min + ' [' + (low <= min && min < low + margin ? 'VALID' : 'INVALID') + ']');
            console.log('  max=' + max + ' [' + (high - margin < max && max < high ? 'VALID' : 'INVALID') + ']');
        }

        var self = this;
        runTest(function() { return self.rnd()}, 0, 1, 0.01);
        runTest(function() { return self.rndInt(200, 2000) }, 200, 2001, 5);
    }

    for(var i=0; i<100; i++) {
        this.rnd();
    }
}