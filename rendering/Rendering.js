function Rendering() {    

    ///////////////////////////////////////////////////////////////////////////
    // utility functions //////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    var fontName = 'Courier New';
    var fontSize = 14;

    var theColor = [1, 1, 0];

    var wIdeal = 600.0;
    var hIdeal = 600.0;

    var setColor       = function(ctx, rgb)          { ctx.fillStyle = 'rgba(' + Math.floor(rgb[0] * 255) + ',' + Math.floor(rgb[1] * 255) + ',' + Math.floor(rgb[2] * 255) + ',255)'; ctx.strokeStyle = ctx.fillStyle; }; 
    var fillCircle     = function(ctx, x, y, r, rgb) { setColor(ctx, rgb); ctx.beginPath(); ctx.arc(x, y, r, 0, 2 * Math.PI); ctx.fill(); };
    var fillRectangle  = function(ctx, r, rgb)       { setColor(ctx, rgb); ctx.beginPath(); ctx.rect(r.x, r.y, r.w, r.h); ctx.fill(); };
    var drawRectangle  = function(ctx, r, rgb)       { setColor(ctx, rgb); ctx.beginPath(); ctx.rect(r.x, r.y, r.w, r.h); ctx.stroke(); };
    
    var mapSize          = function(ctx, value) { return value * Math.min(ctx.canvas.width / wIdeal, ctx.canvas.height / hIdeal); };
    var setFontSize      = function(ctx, size) { size = mapSize(ctx, size); ctx.font = size + 'px ' + fontName; fontSize = size; };
    var drawTextCentered = function(ctx, x, y, text, rgb) { setColor(ctx, rgb); ctx.fillText(text, x - ctx.measureText(text).width / 2, y + fontSize / 2); };
    var drawTextWithBG   = function(ctx, x, y, text, rgb, rgbBG) { fillRectangle(ctx, new Rectangle(x, y, ctx.measureText(text).width, fontSize), rgbBG); setColor(ctx, rgb); ctx.fillText(text, x, y + fontSize - 3); };

    var stars = Star.generate(200);
    
    var drawStars = function (ctx, rect, stars) {        
        var r = rect.shrinkBy(8);
        stars.forEach( function(star) { fillCircle(ctx, r.mapX(star.x), r.mapY(star.y), 2 * star.r + 1, [star.b, star.b, star.b]); });
    };
    
    var drawBackground = function (ctx, rect) {
        drawRectangle(ctx, rect.shrinkBy(-1), [1,1,1]);
        drawStars(ctx, rect, stars);
    };

    ///////////////////////////////////////////////////////////////////////////
    // buttons ////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    var selectedPlanet = null;
    var universeOfSelectedPlanet = null;
    
    var buttons = null;
    var toDraw = null;

    this.clear = function() {
        buttons = new Array();
    };

    var drawButton = function(ctx, rect, btn) {
        fillCircle(ctx, rect.centerX(), rect.centerY(), Math.max(rect.w, rect.h) / 2, [0.7,0.7,0]);
        drawTextCentered(ctx, rect.centerX(), rect.centerY(), btn.text, [0,0,0]);
        btn.rect = rect;
        buttons.push(btn);
    };

    var drawButtonsH = function(ctx, rect, btns) {
        for(var i=0; i<btns.length; i++) {
            var w = rect.w / (btns.length + 1);
            var xy = rect.mapXY((i + 1) * w / rect.w, 0.5);
            drawButton(ctx, new Rectangle(xy[0] - w / 2.5, xy[1] - w / 2.5, w / 1.25, w / 1.25), btns[i]);
        }
    };

    var drawButtonsV = function(ctx, rect, btns) {
        for(var i=0; i<btns.length; i++) {
            var h = rect.h / (btns.length + 1);
            var xy = rect.mapXY(0.5, (i + 1) * h / rect.h);
            drawButton(ctx, new Rectangle(xy[0] - h / 2.5, xy[1] - h / 2.5, h / 1.25, h / 1.25), btns[i]);
        }
    };

    ///////////////////////////////////////////////////////////////////////////
    // universe ///////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////
    
    var mapXY = function(ctx, rect, universe, x, y) { var r = rect.shrinkBy(mapSize(ctx, 40)); return r.mapXY(x/universe.size, y/universe.size); };

    var planetClicked = function(universe, planet) {
        if(planet.getOwner().equals(PlayerProxy)) {
            selectedPlanet = planet;   
            universeOfSelectedPlanet = universe;         
        } else {
            if(selectedPlanet && selectedPlanet.getForces() >= 2) {
                universe.sendFleet(Player, selectedPlanet, selectedPlanet.getForces() / 2, planet);
            }
        }
    };

    var drawPlanets= function(ctx, rect, universe) {
        universe.getAllPlanetProxies().forEach( function(planet) {
            var xy = mapXY(ctx, rect, universe, planet.getX(), planet.getY());
            var r =  mapSize(ctx, 8 + 3 * planet.getRate());
            fillCircle (ctx, xy[0], xy[1], r, planet.getOwner().getBackColor());
            drawTextCentered(ctx, xy[0], xy[1], Math.floor(planet.getForces()),    planet.getOwner().getForeColor());
            r =  mapSize(ctx, 8 + 3 * 5);
            buttons.push(new Button(null, getNameOf(planet.getOwner()), function() { planetClicked(universe, planet); }, new Rectangle(xy[0] - r, xy[1] - r, 2 * r, 2 * r)));
        });

        if(selectedPlanet) {
            if(!selectedPlanet.getOwner().equals(PlayerProxy) || universe != universeOfSelectedPlanet) { 
                selectedPlanet = null; 
            } else {
                var r =  mapSize(ctx, 8 + 3 * 5);
                var xy = mapXY(ctx, rect, universe, selectedPlanet.getX(), selectedPlanet.getY());
                var rect = new Rectangle(xy[0] - r, xy[1] - r, 2 * r, 2 * r);
                rect = rect.shrinkBy(-4);
                drawRectangle(ctx, rect, [1,1,1]);                
            }
        }
    };

    var drawFleets= function(ctx, rect, universe) {
        universe.getAllFleetProxies().forEach( function(fleet) {
            var xy = mapXY(ctx, rect, universe, fleet.getX(), fleet.getY());
            drawTextCentered(ctx, xy[0], xy[1], Math.floor(fleet.getForces()), [1,1,1]);
        });
    };

    var getNameOf = function(bot) { return bot.getCreator() == null ? bot.getName() : bot.getCreator() + "'s " + bot.getName(); }

    var drawBots = function(ctx, rect, universe) {
        var bots = universe.getBotProxies();
        for(var i=0; i<bots.length; i++) {
            if(bots[i].getName() == Bot.None.name) { continue; }
            var text = getNameOf(bots[i]);
            text += ' P[' + bots[i].getPlanetsOf(bots[i]).length +  '/' + Math.floor(bots[i].sum(bots[i].getPlanetsOf(bots[i]), function(planet) { return planet.getForces(); })) + ']';
            text += ' F[' + bots[i].getFleetsOf(bots[i]).length +  '/' + Math.floor(bots[i].sum(bots[i].getFleetsOf(bots[i]), function(fleet) { return fleet.getForces(); })) + ']';
            drawTextWithBG(ctx, rect.x + 0, rect.y + i * fontSize * 1.2, text, bots[i].getForeColor(), bots[i].getBackColor());            
        }
    };

    var drawUI = function(ctx, rects, universe) {
        drawBots(ctx, rects[0], universe);        
    };

    var drawWinnerInfo = function(ctx, rect, universe) {
        setFontSize(ctx, 48);

        var r = universe.winner.getCreator() == null ? new Rectangle(rect.x, rect.centerY() - fontSize - 4, rect.w, fontSize * 2 + 8) : new Rectangle(rect.x, rect.centerY() - fontSize * 1.5 - 4, rect.w, fontSize * 2.5 + 8);
        fillRectangle(ctx, r, [0, 0, 0]);
        r = r.moveBy(0, -8);

        if(universe.winner.getCreator() == null) {
            drawTextCentered(ctx, r.centerX(), r.centerY() - fontSize / 2, universe.winner.getName(), theColor);
            drawTextCentered(ctx, r.centerX(), r.centerY() + fontSize / 2, 'has won. :D', theColor);
        } else {
            drawTextCentered(ctx, r.centerX(), r.centerY() - fontSize, universe.winner.getCreator() + "'s ", theColor);
            drawTextCentered(ctx, r.centerX(), r.centerY(), universe.winner.getName(), theColor);
            drawTextCentered(ctx, r.centerX(), r.centerY() + fontSize, 'has won. :D', theColor);    
        }
    };

    var subDivide = function(rect) {
        return rect.w > rect.h ? [
                new Rectangle(rect.x,                         rect.y, (rect.w - rect.h) / 2, rect.h),
                new Rectangle(rect.x + (rect.w - rect.h) / 2, rect.y, rect.h,                rect.h),
                new Rectangle(rect.x + (rect.w + rect.h) / 2, rect.y, (rect.w - rect.h) / 2, rect.h)
            ] : [
                new Rectangle(rect.x, rect.y,                         rect.w, (rect.h - rect.w) / 2),
                new Rectangle(rect.x, rect.y + (rect.h - rect.w) / 2, rect.w, rect.w),
                new Rectangle(rect.x, rect.y + (rect.h + rect.w) / 2, rect.w, (rect.h - rect.w) / 2)
            ];        
    };

    var drawUniverse = function(ctx, rect, universe) {
        drawRectangle(ctx, rect, [0.5,0.5,0.5]);
        drawPlanets(ctx, rect, universe);
        drawFleets(ctx, rect, universe);
    };

    this.drawUniverseView = function(ctx, rect, universe, btns) {
        drawBackground(ctx, rect);

        setFontSize(ctx, 18);
        var rects = subDivide(rect);
        drawUniverse(ctx, rects[1], universe);
        universe.winner ? drawWinnerInfo(ctx, rect, universe) : drawUI(ctx, rects, universe);

        setFontSize(ctx, 18);
        if(toDraw != null && toDraw[0]++ > 50) { drawTextWithBG(ctx, toDraw[1], toDraw[2] - fontSize, toDraw[3], [1,1,1], [0,0,0]); }

        drawButtonsH(ctx, rects[2], btns);
    };

    this.moved = function(x, y) {
        toDraw = null;
        if(buttons) { buttons.forEach( function(button) { if(button.rect.hit(x,y)) { toDraw = [0, x, y, button.description]; } }); }
    };

    this.clicked = function(x, y) {
        if(buttons) { buttons.forEach( function(button) { if(button.rect.hit(x,y)) { button.hit(); } }); }
    };   

    ///////////////////////////////////////////////////////////////////////////
    // menu ///////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    this.drawTitle = function(ctx, rect) {
        drawBackground(ctx, rect);

        setFontSize(ctx, 48);
        drawTextCentered(ctx, rect.centerX(), rect.centerY(), 'Cycles of War', theColor);
    };

    this.drawLevel = function(ctx, rect, level) {
        drawBackground(ctx, rect);

        setFontSize(ctx, 48);
        drawTextCentered(ctx, rect.centerX(), rect.y + rect.h / 3, 'Cycles of War', theColor);

        setFontSize(ctx, 36);
        drawTextCentered(ctx, rect.centerX(), rect.y + 2 * rect.h / 3, 'Level ' + level.nr, theColor);
    };

    this.drawMenu = function(ctx, rect, buttons) {
        drawBackground(ctx, rect);        

        setFontSize(ctx, 24);
        drawButtonsV(ctx, rect, buttons);
    };
}