function Game() {

    var rendering = new Rendering();
    this.getRendering = function() { return rendering;};

    var activeGameMode = 'Title';
    this.setGameMode = function(mode) { activeGameMode = mode; };

    var gameModes = new Object();
    gameModes['Title'] = new TitleGameMode(this);
    gameModes['Menu']  = new MenuGameMode(this);
    gameModes['Demo']  = new DemoGameMode(this);
    gameModes['Play']  = new PlayGameMode(this);
    
    this.update = function() {
        gameModes[activeGameMode].update();   
    };

    this.draw = function(ctx, rect) {
        rendering.clear();
        gameModes[activeGameMode].draw(ctx, rect);
    };

    this.clicked = function(x, y) { rendering.clicked(x, y); };
    this.moved   = function(x, y) { rendering.moved(x, y);   };
}