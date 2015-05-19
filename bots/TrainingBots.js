function TrainingBots() {}

TrainingBots.Idle = new Bot(null, 'Idle', [0.9, 0.2, 0.2], [0, 0, 0], function(self){});

TrainingBots.ChaseMe = new Bot(null, 'ChaseMe', [0.9, 0.2, 0.2], [0, 0, 0], function(self) {
    var forcesArrivingNextRound = function(self, planet) {
        // look at all hostile fleets heading towards this planet
        // if they arrive within the next round
        // add up their force
        return self.sum(self.getAllFleets(), function(fleet) { 
            return fleet.getTarget() == planet && !fleet.getOwner().equals(self) && fleet.getDistanceToTarget() < 2 * Universe.roundDuration * Universe.flightSpeed ? fleet.getForces() : 0; 
        });
    };

    // for each of my planets
    self.getPlanetsOf(self).forEach( function(planet) {         
        // if I am going to be attacked next round
        if (0 < forcesArrivingNextRound(self, planet)) {

            // look for another planet close by
            var target = planet.getOthersByDistance()[self.rndInt(0, 4)];
            
            // we flee with half of the forces
            var forces = Math.floor(planet.getForces() / 2);
            
            // we have to ensure we have enough troops
            if(forces >= 1){
                // send our forces to the target
                self.sendFleet(planet, forces, target);
            }
        }
    });
});

TrainingBots.Wave = new Bot(null, 'Wave', [0.9, 0.2, 0.2], [0, 0, 0], function(self) {
    // for each of my planets
    self.getPlanetsOf(self).forEach( function(planet) {         
        // if I have enough inhabitants to send one to each other planet
        if(planet.getForces() > self.getAllPlanets().length) {
            // send one ship to each other planet
            planet.getOthers().forEach( function(target) {
                self.sendFleet(planet, 1, target);
            });
        }
    });
});

TrainingBots.BigGun = new Bot(null, 'BigGun', [0.9, 0.2, 0.2], [0, 0, 0], function(self) {
    // my homeplanet is the oldest one I got
    var homeplanet = self.min(self.getPlanetsOf(self), function(planet) { return planet.getLastTimeOwnershipChanged(); });

    // if I have enough forces on the home planet
    if(homeplanet.getForces() > 70) {
        
        // choose the closest hostile planet
        var target = self.hostileOnly(homeplanet.getOthersByDistance())[0];
        if(target){
            // and attack it
            self.sendFleet(homeplanet, 50, target);
        }
    }
   
    // for each of my other planets
    self.mineOnly(homeplanet.getOthers()).forEach( function(planet) {         
        // if I have enough forces to support the home planet
        if(planet.getForces() > 20) {
            // send them there
            self.sendFleet(planet, 10, homeplanet);
        }
    });
});

TrainingBots.Random = new Bot(null, 'Random', [0.9, 0.2, 0.2], [0, 0, 0], function(self) {
    // for each of my planets
    self.getPlanetsOf(self).forEach( function(planet) {         
        // if there are enough forces to attack
        if(planet.getForces() > 20) {
            // send half the forces to some randomly chosen planet
            self.sendFleet(planet, Math.floor(planet.getForces() / 2), planet.getOthers()[Math.floor(self.rnd() * planet.getOthers().length)]);
        }
    });
});

TrainingBots.Worm = new Bot(null, 'Worm', [0.9, 0.2, 0.2], [0, 0, 0], function(self) {
    // sort my planets by latest ownership change (index=0 will be my oldest, index=size-1 my newest planet)
    var planets = self.getPlanetsOf(self);
    planets.sort( function(p1, p2) { return p2.getLastTimeOwnershipChanged() - p1.getLastTimeOwnershipChanged(); });

    // for each of my planets
    planets.forEach( function(planet) {
        // if a planet has enough forces to attack
        if (planet.getForces() > 20) {

            // get its index to see where it is in the queue
            var index = planets.indexOf(planet);

            var target = null;
            // if it is the head
            if (index == 0) {
                // attack the closest hostile planet
                target = self.hostileOnly(planet.getOthersByDistance())[0];
            } else {
                // if it is part of the tail, send troops to the next part of the tail
                // that is closer to the head
                target = planets[index - 1];
            }
            if(target) { self.sendFleet(planet, 10, target); }
        }
    });
});

TrainingBots.PowersOf2 = new Bot(null, 'PowersOf2', [0.9, 0.2, 0.2], [0, 0, 0], function(self) {
    // for all my planets
    var planets = self.getPlanetsOf(self);
    for(var i=0; i<planets.length; i++) {
        var planet = planets[i];

        // if I have enough forces 
        if(planet.getForces() < 64)
            continue;
        
        // current fleet size. this value is getting halved each round
        var fleet = 32;
        
        // for all the other planets ordered by the distance (closest planets first)
        var others = planet.getOthersByDistance();
        for(var i2=0; i2<others.length; i2++) {
            var other = others[i2];

            // send a fleet there
            self.sendFleet(planet, fleet, other);
            
            // reduce the fleet size by 50%
            fleet = fleet / 2;
            
            // go on with the next of my planets, if the forces of this one are depleted
            if(fleet < 1)
                break;
        }
    }
});

TrainingBots.Sniper = new Bot(null, 'Sniper', [0.9, 0.2, 0.2], [0, 0, 0], function(self) {
    // if I still have active fleets, I pass
    if (self.getFleetsOf(self).length > 0) { return; }
    
    // no active fleets -> let's shoot all we got! :D
    
    // for all my planets
    self.getPlanetsOf(self).forEach( function(planet) {
        // I want to send half my forces
        var force = Math.floor(planet.getForces() / 2);
        
        // towards a randomly chosen hostile planet
        var targets = self.hostileOnly(self.getAllPlanets());
        var target = targets[Math.floor(self.rnd() * targets.length)];
        
        // and go
        if (force >= 1 && target != null) {
            self.sendFleet(planet, force, target);
        }
    });
});

TrainingBots.NewLeader = new Bot(null, 'NewLeader', [0.9, 0.2, 0.2], [0, 0, 0], function(self) {
    // sort my planets by latest ownership change (index=0 will be my oldest, index=size-1 my newest planet)
    var planets = self.getPlanetsOf(self);
    planets.sort( function(p1, p2) { return p2.getLastTimeOwnershipChanged() - p1.getLastTimeOwnershipChanged(); });

    // for each of my planets
    planets.forEach( function(planet) {

        // if a planet has enough forces to attack
        if (planet.getForces() > 20) {

            // attack the hostile planet that is closest to the front planet
            var target = self.hostileOnly(planets[0].getOthersByDistance())[0];
            if(target) { self.sendFleet(planet, 10, target); }
        }
    });
});

TrainingBots.CloseBonds = new Bot(null, 'CloseBonds', [0.9, 0.2, 0.2], [0, 0, 0], function(self) {
    var sendFleetUpTo = function(planet, force, target) {
        if(target) { self.sendFleet(planet, force, target); }
    }
    // for each of my planets
    self.getPlanetsOf(self).forEach( function(planet) {
        // if I have enough forces to act
        if(planet.getForces() > 30) {
            
            // send 10 attacking forces to my closest enemy
            sendFleetUpTo(planet, 10, self.hostileOnly(planet.getOthersByDistance())[0]);
            
            // send 5 defending forces to each of my closest allies
            sendFleetUpTo(planet, 5, self.mineOnly(planet.getOthersByDistance())[0]);
            sendFleetUpTo(planet, 5, self.mineOnly(planet.getOthersByDistance())[1]);
        }
    });
});

TrainingBots.Front = new Bot(null, 'Front', [0.9, 0.2, 0.2], [0, 0, 0], function(self) {
    var getFrontPlanet = function(planet, maxNumberNeighborsConsidered) {
        
        // consider only the current planet and some of it's neighbors
        var planets = self.mineOnly(planet.getOthersByDistance()).slice(0, maxNumberNeighborsConsidered);
        planets.push(planet);

        // sort them by distance to the next enemy
        var distanceToNextEnemy = function(planet) { return planet.getDistanceTo(self.hostileOnly(planet.getOthersByDistance())[0]); };
        planets.sort( function(p1, p2) { return distanceToNextEnemy(p1) - distanceToNextEnemy(p2); } );

        // return the one that is closest to an enemy
        return planets[0];
    };

    // if there is no hostile planet, I pass
    if(self.hostileOnly(self.getAllPlanets()).length < 1) { return; }
    
    // for each of my planets
    self.getPlanetsOf(self).forEach( function(planet) {

        // if I have enough forces to act
        if (planet.getForces() > 12) {

            // select the planet that is closest to the enemy
            // only considering this one and it's 3 closest neighbors
            var frontPlanet = getFrontPlanet(planet, 3);
            
            // if I am not the front planet
            if (planet != frontPlanet) {
                
                // send half of my troops to support it
                self.sendFleet(planet, planet.getForces() / 2, frontPlanet);
            } else {
                
                // if I am the front planet, send half of my troops towards the closest enemy
                self.sendFleet(frontPlanet, frontPlanet.getForces() / 2, self.hostileOnly(planet.getOthersByDistance())[0]);
            }
        }
    });
});

TrainingBots.Cells = new Bot(null, 'Cells', [0.9, 0.4, 0.4], [0, 0, 0], function(self) {
    var everybodyIsReady = function() {
        // for each of my planets
        var planets = self.getPlanetsOf(self);
        for(var i=0; i<planets.length; i++) {

            // if there are not enough troops on this planet, we are not ready yet
            if(planets[i].getForces() < 20) { return false; }
        }
        
        // we only end up here, when everyone is ready :)
        return true;
    }; 

    // if everyone has enough troops to attack
    if(!everybodyIsReady()) { return; }

    // each of my planets
    self.getPlanetsOf(self).forEach( function(planet) {
        
        // send a fleet to the closest hostile target.
        var target = self.hostileOnly(planet.getOthersByDistance())[0];
        if(target) { self.sendFleet(planet, Math.floor(planet.getForces() / 2), target); }
    });
});

TrainingBots.Closest = new Bot(null, 'Closest', [1.0, 0.0, 0.0], [0, 0, 0], function(self) {
    // for each of my planets
    self.getPlanetsOf(self).forEach( function(planet) {         
        // if there are enough forces to attack
        if(planet.getForces() > 20) {
            // attack the hostile planet that is closest to this planet
            var target = self.hostileOnly(planet.getOthersByDistance())[0];
            if(target) { self.sendFleet(planet, 10, target); }
        }
    });
});


TrainingBots.BraveRabbit = new Bot(null, 'BraveRabbit', [0.5, 0.0, 0.0], [0, 0, 0], function(self) {
    // I own all planets. Let's give everybody else some time to catch up ^^
    if(self.hostileOnly(self.getAllPlanets()).length < 1) { return; }

    // for each planet
    self.getPlanetsOf(self).forEach( function(planet) {
        
        // get closest hostile planet
        var target = self.hostileOnly(planet.getOthersByDistance())[0];

        // jump around
        if (target && planet.getForces() >= 31) { self.sendFleet(planet, 31, target); }
    });
});

TrainingBots.All = [TrainingBots.Idle, TrainingBots.ChaseMe, TrainingBots.BigGun, TrainingBots.Wave, TrainingBots.Random, TrainingBots.Worm,
    TrainingBots.PowersOf2, TrainingBots.Sniper, TrainingBots.NewLeader, TrainingBots.CloseBonds, TrainingBots.Front, TrainingBots.Cells,
    TrainingBots.Closest, TrainingBots.BraveRabbit];