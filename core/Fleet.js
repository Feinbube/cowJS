function FleetProxy(fleet) {
    var instance = fleet;

    this.getForces           = function() { return instance.forces; };
    this.getOwner            = function() { return instance.getOwnerProxy(); };
    this.getX                = function() { return instance.x; };
    this.getY                = function() { return instance.y; };
    this.getTarget           = function() { return instance.getTargetProxy(); };
    this.getDistanceToTarget = function() { return instance.distanceToTarget; };
}

function Fleet(universe, owner, forces, home, target) {
    this.universe = universe;
    this.owner = owner;
    this.forces = forces;
    this.x = home.x;
    this.y = home.y;    
    this.target = target;
    this.distanceToTarget = home.getDistanceTo(target);

    this.getTargetProxy = function() { return universe.getPlanetProxy(this.target); };
    this.getOwnerProxy  = function() { return universe.getBotProxy(this.owner); };
    this.update = function(elapsed) { 
        var xDiff = this.x - target.x;
        var yDiff = this.y - target.y;

        this.distanceToTarget = Math.sqrt(xDiff * xDiff + yDiff * yDiff);

        if (this.distanceToTarget < Universe.flightSpeed * elapsed)
            universe.fleetArrived(this);

        xDiff = xDiff / this.distanceToTarget;
        yDiff = yDiff / this.distanceToTarget;
        
        this.x -= Universe.flightSpeed * elapsed * xDiff;
        this.y -= Universe.flightSpeed * elapsed * yDiff;
    };
}

Fleet.generateProxies = function(fleets) {
    var result = new Array();
    fleets.forEach( function(fleet) { result.push(new FleetProxy(fleet)); });
    return result;
}