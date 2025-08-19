var WIDTH = 240;
var HEIGHT = 135;
var gameIndex = 0;
var games = ["Breakout", "Snake", "Space Shooter"];
var gameScripts = ["breakout.js", "snake.js", "spaceshooter.js"];
var WHITE = 16777215;
var YELLOW = 16776960;
var BLACK = 0;

function drawMenu() {
    fillScreen(BLACK);
    setTextSize(2);
    setTextColor(YELLOW);
    drawString("Select Game", 70, 20);
    
    setTextSize(1);
    for (var i = 0; i < games.length; i++) {
        if (i === gameIndex) {
            setTextColor(YELLOW);
        } else {
            setTextColor(WHITE);
        }
        drawString(games[i], 100, 50 + i * 20);
    }
}

function handleInput() {
    if (getPrevPress()) {
        gameIndex = (gameIndex - 1 + games.length) % games.length;
        drawMenu();
    } else if (getNextPress()) {
        gameIndex = (gameIndex + 1) % games.length;
        drawMenu();
    } else if (getSelPress()) {
        loadGame(gameScripts[gameIndex]);
    }
}

function loadGame(script) {
    eval(fetch(script));
}

function main() {
    drawMenu();
    while (true) {
        handleInput();
        delay(100);
    }
}

main();