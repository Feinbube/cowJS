function PlanetProxy(planet) {
    var instance = planet;
    var getDistanceToCache = new Array();
    var getOthersByDistanceCache = null;

    this.getId                       = function() { return instance.id; };
    this.getForces                   = function() { return instance.forces; };
    this.getOwner                    = function() { return instance.getOwnerProxy(); };
    this.getX                        = function() { return instance.x; };
    this.getY                        = function() { return instance.y; };
    this.getRate                     = function() { return instance.rate; };
    this.getLastTimeOwnershipChanged = function() { return instance.lastTimeOwnershipChanged; };
    this.getOthers =  function() { return instance.getAllProxies().filter( function(planetProxy) { return planetProxy != this; }, this ); };
    this.getDistanceTo = function(other) {
        if(getDistanceToCache[other.getId()] == undefined) { getDistanceToCache[other.getId()] = Planet.getDistance(other.getX(), other.getY(), this.getX(), this.getY()); }
        return getDistanceToCache[other.getId()];
    };
    this.getOthersByDistance = function() {
        if(getOthersByDistanceCache == null) {
            getOthersByDistanceCache = this.getOthers();
            var self = this;
            getOthersByDistanceCache.sort( function(p1, p2) { 
                return self.getDistanceTo(p1) - self.getDistanceTo(p2); 
            });
        }
        return getOthersByDistanceCache.slice();
    };
}

function Planet(id, universe, owner, rate, x, y) {
    this.id = id;
    this.universe = universe;
    this.owner = owner;
    this.x = x ? x : this.universe.size * this.universe.random.rnd();
    this.y = y ? y : this.universe.size * this.universe.random.rnd();    
    this.rate = rate >= 0 ? rate : this.universe.random.rndInt(1, 4);
    this.forces = this.rate * 10;
    this.lastTimeOwnershipChanged = this.universe.now;

    this.getOwnerProxy = function() { return universe.getBotProxy(this.owner); };
    this.getAllProxies = function() { return this.universe.getAllPlanetProxies(); };

    var getDistanceToCache = new Array();
    this.getDistanceTo = function(other) {
        if(getDistanceToCache[other.id] == undefined) { getDistanceToCache[other.id] = Planet.getDistance(other.x, this.x, other.y, this.y); }
        return getDistanceToCache[other.id];
    };
}

Planet.getDistance = function(fromX, fromY, toX, toY) {
    var xDiff = fromX - toX;
    var yDiff = fromY - toY;

    return Math.sqrt(xDiff * xDiff + yDiff * yDiff);     
}


Planet.generate = function(universe, bots, planetsPerBot) {
    var suiteablePlanet = function(id, universe, owner, rate, planets) {
        planet = null;
        while(planet == null) {
            planet = new Planet(id, universe, owner, rate);
            for(var i = 0; i < planets.length; i++) {
                if(Planet.getDistance(planet.x, planet.y, planets[i].x, planets[i].y) < (planets[i].rate + planet.rate) / 2.0 * Universe.flightSpeed) {
                    planet = null;
                    break;
                }
            }
        }
        return planet;
    };

    var planets = new Array();
    var id = 0;
    for(; id <                       bots.length; id++) { planets[id] = suiteablePlanet(id, universe, bots[id],  5, planets); }
    for(; id < (planetsPerBot + 1) * bots.length; id++) { planets[id] = suiteablePlanet(id, universe, Bot.None, -1, planets); }
    return planets;
}

Planet.generateProxies = function(planets) {
    var result = new Array();
    planets.forEach( function(planet) { result[planet.id] = new PlanetProxy(planet); });
    return result;
}