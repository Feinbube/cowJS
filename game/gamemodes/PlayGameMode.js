function PlayGameMode(thegame) {
    var levels = Level.All;
    var activeLevel = 0;

    var game = thegame;
    var rendering = game.getRendering();

    var next = false;
    var timer = 0;

    this.update = function() {
        levels[activeLevel].universe.update();

        if(!next && levels[activeLevel].universe.winner) {
            next = true;
            timer = Date.now();
        }
        if(next && Date.now() - timer > 3000) {
            next = false;
            activeLevel++;
        }
    };

    this.draw = function(ctx, rect) { 
        rendering.drawUniverseView(ctx, rect, levels[activeLevel].universe, UI.getUIButtons(levels[activeLevel].universe));
    };
}