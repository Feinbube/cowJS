function Rectangle(x, y, w, h) { 
    this.x = x; 
    this.y = y; 
    this.w = w; 
    this.h = h; 

    this.left    = function() { return this.x; };
    this.right   = function() { return this.x + this.w; };
    this.top     = function() { return this.y; };
    this.bottom  = function() { return this.y + this.h; };
    this.centerX = function() { return this.x + this.w / 2; };
    this.centerY = function() { return this.y + this.h / 2; };
    this.center  = function() { return [this.centerX(), this.centerY()]; };

    this.moveTo     = function(x, y) { return new Rectangle(x, y, this.w, this.h); };
    this.moveBy     = function(x, y) { return new Rectangle(this.x + x, this.y + y, this.w, this.h); };
    this.shrinkBy   = function(m)    { return this.shrinkByXY(m, m); };
    this.shrinkByXY = function(x, y) { return new Rectangle(this.x + x/2, this.y + y/2, this.w - x, this.h - y); };
    this.clone      = function()     { return new Rectangle(this.x, this.y, this.w, this.h); };
    
    this.mapX   = function(x)       { return x * this.w + this.x; };
    this.mapY   = function(y)       { return y * this.h + this.y; };
    this.mapXY  = function(x, y)    { return [this.mapX(x), this.mapY(y)]; };

    this.hit    = function(x ,y)    { return this.x <= x && x <= this.right() && this.y <= y && y <= this.bottom(); };
}