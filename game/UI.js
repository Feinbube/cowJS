function UI() {}

UI.getUIButtons = function(universe) {
    return [
        universe.isPaused ? new Button('|>', 'Resume the game.', function() { universe.isPaused = false; }) : new Button('||', 'Pause the game.', function() { universe.isPaused = true; }),
        new Button('<<', 'Slow down of the game.', function() { universe.decreaseSpeed(); }),
        new Button('>>', 'Speed up of the game.', function() { universe.increaseSpeed(); }),
        new Button('???', '???', function() { }),
        new Button('???', '???', function() { }),
        new Button('???', '???', function() { })
    ];
}

UI.getMenuButtons = function(game) {
    return [
        new Button('Play', '???', function() { game.setGameMode('Play'); }),
        new Button('Demo', '???', function() { game.setGameMode('Demo'); }),
        new Button('???', '???', function() { }),
        new Button('???', '???', function() { })
    ];
}