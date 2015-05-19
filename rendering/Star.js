function Star(x, y, r, b) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.b = b;   
}

// public static methods //////////////////////////////////////////////////////
Star.generate = function(count) {
    var stars = new Array();
    for(var i=0;i<count;i++) {
        stars[i] = new Star(Math.random(), Math.random(), Math.random(), 0.3 + Math.random() * 0.7);
    }
    return stars;
}