function MenuGameMode(thegame) {
    var game = thegame;
    var rendering = game.getRendering();

    this.update = function() {};

    this.draw = function(ctx, rect) { 
        rendering.drawMenu(ctx, rect, UI.getMenuButtons(game));
    };
}