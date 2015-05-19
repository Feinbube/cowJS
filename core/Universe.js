function Universe(seed, bots, planetsPerBot, timeoutEnabled) {

    // universe ///////////////////////////////////////////////////////////////
    this.random = new RandomGenerator(seed);
    this.size = Math.sqrt(bots.length);
    this.now = 0.0;
    var seed = seed;
    var currentRound = 0;
    var nothingHappenedCounter = 0;
    var gameOver = false;
    var roundsPerUpdate = 4.0;
    var roundUpdateCounter = 0.0;
    this.isPaused = false;
    this.timeoutEnabled = timeoutEnabled;

    // bots /////////////////////////////////////////////////////////////////
    var bots = bots;
    bots.forEach( function(bot) { bot.universe = this; }, this);
    var botProxies = Bot.generateProxies(bots);
    this.getBotProxy = function(bot) { return botProxies[bot.creator + bot.name]; };
    this.getBotProxies = function() { 
        var result = new Array();
        for(var botName in botProxies) {
            if(botProxies.hasOwnProperty(botName)) { result.push(botProxies[botName]); }
        }
        return result;
    };
    this.winner = null;
    var activeBot = null;

    // planets ////////////////////////////////////////////////////////////////
    var planets = Planet.generate(this, bots, planetsPerBot);
    var planetProxies = Planet.generateProxies(planets);
    var newForces = new Object();
    var getPlanetsOf = function(bot) { return planets.filter(function(planet) { return planet.owner.equals(bot); }); };
    this.getAllPlanetProxies = function()       { return planetProxies.slice(); };
    this.getPlanetProxy      = function(planet) { return planetProxies[planet.id]; }
    this.getPlanetProxiesOf  = function(bot)    { return this.getAllPlanetProxies().filter(function(planetProxy) { return planetProxy.getOwner().equals(bot); }); };

    // fleets ////////////////////////////////////////////////////////////////
    var fleets = new Array();
    var fleetsAtDestination = new Array();
    var newFleets = new Array();
    var lastFleetArrivalTime = 0.0;
    var getAllFleets        = function()    { return fleets.slice().concat(newFleets.filter(function(fleet) { return fleet.owner.equals(activeBot); })); };
    var getFleetsOf         = function(bot) { return getAllFleets().filter(function(fleet) { return fleet.owner.equals(bot); }); };    
    this.getAllFleetProxies = function()    { return Fleet.generateProxies(getAllFleets()); };
    this.getFleetProxiesOf  = function(bot) { return this.getAllFleetProxies().filter(function(fleet) { return fleet.getOwner().equals(bot); }); };

    // private methods ////////////////////////////////////////////////////////
    var onlyInFirstList = function(list1, list2) {
        var result = new Array();
        list1.forEach( function(item) { if(list2.indexOf(item) < 0) { result.push(item); } });
        return result;
    };
    var getWinner = function(universe) {
        var result = null;
        var botProxies = universe.getBotProxies();
        for(var i=0; i<botProxies.length; i++) {
            var botProxy = botProxies[i];
            if(!botProxy.equals(new BotProxy(Bot.None)) && universe.getFleetProxiesOf(botProxy).length + universe.getPlanetProxiesOf(botProxy).length > 0) {
                if(result != null) { return null; }
                if(result == null) { result = botProxy; }
            }
        }
        return result;
    };  
    var check = function(bot, home, target, forces) {
        if(bot == null)                { throw 'Only active bots are allowed to act! (was null)'; }
        if(bot == undefined)           { throw 'Only active bots are allowed to act! (was undefined)'; }
        if(activeBot.equals(Bot.None) && !bot.equals(Player)) { throw 'Only active bots are allowed to act! (was none)'; }        
        if(!activeBot.equals(bot) && !bot.equals(Player))     { throw 'Only active bots are allowed to act! (was ' + bot.name + ' instead of ' + activeBot.name + ')'; }
        if(!bot.equals(home.owner))    { throw "Fleet must be send from owned planet! (Sender: " + owner + "; Planet owner: " + home.owner + ")"; }
        if(forces < 1)                 { throw "Force must be at least 1, but was " + forces + "!"; }
        if(target == null)             { throw "Fleet must have a target! (was null)"; }
        if(target == undefined)        { throw "Fleet must have a target! (was undefined)"; }
        if(target == home)             { throw "Start and target are not allowed to be identical!"; }        
        if(forces > home.forces)       { throw new IllegalArgumentException("Fleet size (" + forces + ") exceeds planetary forces (" + home.forces + ")"); }
    };  
    var getBot = function(proxy) {
        for(var i=0; i<bots.length; i++) {
            if(bots[i].creator == proxy.getCreator() && bots[i].name == proxy.getName()) { return bots[i]; }
        }
        return null;
    };

    // public methods ////////////////////////////////////////////////////////
    this.update = function() {
        if(this.isPaused) { return; }

        if(roundsPerUpdate >= 1) {
            for(var i = 0; i < roundsPerUpdate; i++){
                this.updateUniverse(Universe.roundDuration);
            }            
        } else {
            roundUpdateCounter++;
            if(roundUpdateCounter > 1 / roundsPerUpdate) {
                roundUpdateCounter = 0;
                this.updateUniverse(Universe.roundDuration);
            }
        }
    }

    this.increaseSpeed = function() {
        roundsPerUpdate *= 2;
    }

    this.decreaseSpeed = function() {
        roundsPerUpdate /= 2;
    }

    this.updateUniverse = function(elapsed) {
        if(gameOver) { return; }

        this.now += elapsed;
        nothingHappenedCounter++;
        currentRound++;

        newFleets.forEach( function(fleet) { fleets.push(fleet); });
        newFleets = new Array();

        planets.forEach( function(planet) { planet.forces = planet.owner.equals(Bot.None) ? planet.forces : planet.forces + planet.rate * elapsed; });
        fleets.forEach( function(fleet) { fleet.update(elapsed); });

        fleetsAtDestination.sort( function(f1, f2) { return f1.distanceToTarget - f2.distanceToTarget; });
        fleetsAtDestination.forEach( function(fleet) {
            var target = fleet.target;
            target.forces = target.owner.equals(fleet.owner) ? target.forces + fleet.forces : target.forces - fleet.forces;
            if(target.forces < 0) {
                target.forces = -target.forces;
                target.owner = fleet.owner;
                target.lastTimeOwnershipChanged = this.now;
            }
        }, this);
        fleets = onlyInFirstList(fleets, fleetsAtDestination);
        fleetsAtDestination = new Array();

        this.winner = getWinner(this);
        if(this.winner) {
            gameOver = true;
            console.log('We have a winner! :D');
            return;
        }

        planets.forEach( function(planet) { newForces[planet.id] = planet.forces; });

        var roundSeed = this.random.rndLong();

        bots.forEach( function(bot) {
            if(getPlanetsOf(bot).length >= 1) { 
                this.random.setSeed(roundSeed);
                activeBot = bot;
                bot.act();
                getPlanetsOf(bot).forEach( function(planet) { var oldForces = newForces[planet.id]; newForces[planet.id] = planet.forces; planet.forces = planet.oldForces; });
            }
        }, this);
        activeBot = Bot.None;

        planets.forEach( function(planet) { planet.forces = newForces[planet.id]; });

        this.random.setSeed(roundSeed);

        if(timeoutEnabled && (nothingHappenedCounter > 1000 || currentRound > 100000)) {
            this.winner = new BotProxy(Bot.None);
            gameOver = true;
            console.log('Time is up! :D');
        }
    };
    this.sendFleet = function(bot, home, forces, target) {
        home = planets[home.getId()];
        target = planets[target.getId()];
        check(bot, home, target, forces);
        var newFleet = new Fleet(this, bot, forces, home, target);
        newFleets.push(newFleet);
        home.forces -= forces;
        nothingHappenedCounter = 0;
        return newFleet;
    };
    this.fleetArrived = function(fleet) { fleetsAtDestination.push(fleet); };
    this.getWinner = function() {
        return winner;
    }
}

Universe.roundDuration = 0.05;
Universe.flightSpeed = 0.05;
