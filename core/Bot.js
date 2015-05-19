function BotProxy(bot) {
    var instance = bot;

    var filter = function(list, bot, shallBeEqual) {
        var result = new Array();
        var self = this;
        list.forEach( function(item) { if(item.getOwner().equals(bot) == shallBeEqual) { result.push(item); }});
        return result;
    };

    this.getCreator    = function()                     { return instance.creator; };
    this.getName       = function()                     { return instance.name; };
    this.getBackColor  = function()                     { return instance.backColor; };
    this.getForeColor  = function()                     { return instance.foreColor; };
    this.equals        = function(other)                { return other.getName() == this.getName() && other.getCreator() == this.getCreator(); };
    this.getAllFleets  = function()                     { return instance.universe.getAllFleetProxies(); };
    this.getAllPlanets = function()                     { return instance.universe.getAllPlanetProxies(); };
    this.getFleetsOf   = function(bot)                  { return instance.universe.getFleetProxiesOf(bot); };
    this.getPlanetsOf  = function(bot)                  { return instance.universe.getPlanetProxiesOf(bot); };
    this.sendFleet     = function(home, forces, target) { return instance.universe.sendFleet(instance, home, forces, target); };
    this.rnd           = function()                     { return instance.universe.random.rnd(); };
    this.rndInt        = function(min, max)             { return instance.universe.random.rndInt(min, max); };

    this.mineOnly      = function(list)                 { return filter(list, this, true) };
    this.hostileOnly   = function(list)                 { return filter(list, this, false) };
    
    this.min           = function(list, valueGetter)    { 
        var result = null;
        var min = 100000000;
        list.forEach( function(item) { var value = valueGetter(item); if(value < min) { min = value; result = item; } });
        return result;
    };
    this.max           = function(list, valueGetter)    { 
        var result = null;
        var max = -100000000;
        list.forEach( function(item) { var value = valueGetter(item); if(value > max) { max = value; result = item; } });
        return result;
    };
    this.sum           = function(list, valueGetter)    { 
        var sum = 0;
        list.forEach( function(item) { sum += valueGetter(item); });
        return sum;
    };
}

function Bot(creator, name, backColor, foreColor, act) {
    this.creator = creator;
    this.name = name;
    this.backColor = backColor;
    this.foreColor = foreColor;
    this.universe = null;

    this.act    = function()      { act(this.universe.getBotProxy(this)); };
    this.equals = function(other) { return other.name == this.name && other.creator == this.creator; };
}

Bot.None = new Bot(null, 'Nobody', [0.6, 0.6, 0.6], [0, 0, 0], function(){});

Bot.generateProxies = function(bots) {
    var result = new Object();
    bots.forEach( function(bot) { result[bot.creator + bot.name] = new BotProxy(bot); });
    result[Bot.None.creator + Bot.None.name] = new BotProxy(Bot.None);
    return result;
}