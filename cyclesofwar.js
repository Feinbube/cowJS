var game = null;

function cyclesofwar() {
    game = new Game();
    gameloop();
}

function gameloop() {
    setTimeout(gameloop, 20);

    game.update();
    drawCanvas();
}

function drawCanvas() {
    var canvas = document.getElementById('mycanvas');
    if (canvas.getContext){
        var ctx = canvas.getContext('2d');
        var r = getViewRectangle(ctx, 'PhonePortrait');

        ctx.canvas.width  = r.x + r.w + 2;
        ctx.canvas.height = r.y + r.h + 2;

        game.draw(ctx, r);
    } else {
        alert('You need Safari or Firefox 1.5+ to see this demo.');
    }
}

function getViewRectangle(ctx, id) {
    if(id == 'FullScreen')     return new Rectangle(0, 0, window.innerWidth - ctx.canvas.offsetLeft * 3, window.innerHeight - ctx.canvas.offsetTop * 3);
    if(id == 'PhonePortrait')  return new Rectangle(20, 20, 480, 800);
    if(id == 'PhoneLandscape') return new Rectangle(20, 20, 800, 480); 
    return null;
}

function clicked(event) {
    game.clicked(event.offsetX, event.offsetY);
}

function moved(event) {
    game.moved(event.offsetX, event.offsetY);
}