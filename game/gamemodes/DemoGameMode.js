function DemoGameMode(thegame) {
    
    var getNext = function() { return new Universe(Math.random()*100000, TrainingBots.All.slice(TrainingBots.All.length - 3), 2); };

    var universe = getNext();

    var game = thegame;
    var rendering = game.getRendering();

    var next = false;
    var timer = 0;

    this.update = function() {
        universe.update();

        if(!next && universe.winner) {
            next = true;
            timer = Date.now();
        }
        if(next && Date.now() - timer > 3000) {
            next = false;
            universe = getNext();
        }
    };

    this.draw = function(ctx, rect) { 
        rendering.drawUniverseView(ctx, rect, universe, UI.getUIButtons(universe));
    };
}