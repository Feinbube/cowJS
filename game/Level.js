function Level(nr, universe, awards) {
    this.nr = nr;
    this.universe = universe;
    this.awards = awards;
}

Level.All = [
    new Level( 1, new Universe(Math.random()*100000, [TrainingBots.Idle, Player], 3), null),
    new Level( 2, new Universe(Math.random()*100000, [TrainingBots.ChaseMe, Player], 3), null),
    new Level( 3, new Universe(Math.random()*100000, [TrainingBots.BigGun, Player], 3), null),
    new Level( 5, new Universe(Math.random()*100000, [TrainingBots.Wave, Player], 3), null),
    new Level( 6, new Universe(Math.random()*100000, [TrainingBots.Random, Player], 3), null),
    new Level( 7, new Universe(Math.random()*100000, [TrainingBots.Worm, Player], 3), null),
    new Level( 8, new Universe(Math.random()*100000, [TrainingBots.PowersOf2, Player], 3), null),
    new Level( 9, new Universe(Math.random()*100000, [TrainingBots.Sniper, Player], 3), null),
    new Level(10, new Universe(Math.random()*100000, [TrainingBots.NewLeader, Player], 3), null),
    new Level(11, new Universe(Math.random()*100000, [TrainingBots.CloseBonds, Player], 3), null),
    new Level(12, new Universe(Math.random()*100000, [TrainingBots.Front, Player], 3), null),
    new Level(13, new Universe(Math.random()*100000, [TrainingBots.Cells, Player], 3), null),
    new Level(14, new Universe(Math.random()*100000, [TrainingBots.Closest, Player], 3), null),
    new Level(15, new Universe(Math.random()*100000, [TrainingBots.BraveRabbit, Player], 3), null)
]