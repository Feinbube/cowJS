function TitleGameMode(thegame) {
    var game = thegame;
    var rendering = game.getRendering();
    var start = Date.now();

    this.update = function() {
        if(Date.now() - start > 1500) {
            game.setGameMode('Menu');
        }
    };

    this.draw = function(ctx, rect) { 
        rendering.drawTitle(ctx, rect); 
    };
}