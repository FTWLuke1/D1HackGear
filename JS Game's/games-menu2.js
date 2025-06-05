var WIDTH = 240;
var HEIGHT = 135;
var GRID_SIZE = 10;
var COLS = Math.floor(WIDTH / GRID_SIZE);
var ROWS = Math.floor(HEIGHT / GRID_SIZE);

var BLACK = 0;
var WHITE = 16777215;
var GREEN = 65280;
var RED = 16711680;
var BLUE = 255;
var YELLOW = 16776960;
var ORANGE = 16753920;
var PURPLE = 8388736;
var CYAN = 65535;
var MAGENTA = 16711935;
var DARKBLUE = 128;
var DARKRED = 8388608;
var LIGHTBLUE = 10025880;
var LIGHTGREEN = 8453888;
var GRAY = 8421504;
var DARKGRAY = 4210752;
var LIGHTGRAY = 12632256;
var GOLD = 16766720;
var BROWN = 10824234;

var STATE_MAIN_MENU = 0;
var STATE_SNAKE_GAME = 10;
var STATE_SNAKE_OVER = 11;
var STATE_BREAKOUT_MENU = 20;
var STATE_BREAKOUT_GAME = 21;
var STATE_BREAKOUT_OVER = 22;
var STATE_BREAKOUT_WIN = 23;
var STATE_BREAKOUT_NEXT = 24;
var STATE_SPACE_MENU = 30;
var STATE_SPACE_GAME = 31;
var STATE_SPACE_OVER = 32;
var STATE_SPACE_LEVEL = 33;
var STATE_FLAPPY_MENU = 40;
var STATE_FLAPPY_GAME = 41;
var STATE_FLAPPY_OVER = 42;
var STATE_SLOT_MENU = 50;
var STATE_SLOT_GAME = 51;
var STATE_SLOT_WIN = 52;
var STATE_BLACKJACK_MENU = 60;
var STATE_BLACKJACK_BET = 61;
var STATE_BLACKJACK_GAME = 62;
var STATE_BLACKJACK_OVER = 63;
var STATE_EXIT = 99;

var gameState = STATE_MAIN_MENU;
var selectedGame = 0;
var isPaused = false;
var frameCounter = 0;
var mainMenuSelection = 0;
var mainMenuScroll = 0;
var MENU_VISIBLE_ITEMS = 4;

var exitConfirm = false;
var confirmSelection = 0;

function initializeGame() {
    gameState = STATE_MAIN_MENU;
    selectedGame = 0;
    isPaused = false;
    frameCounter = 0;
    mainMenuSelection = 0;
    mainMenuScroll = 0;
}

function drawMainMenu() {
    fillScreen(BLACK);

    setTextSize(3);
    setTextColor(YELLOW);
    drawString("ARCADE", 75, 20);
    drawString("GAMES", 80, 45);

    var menuItems = ["SNAKE", "BREAKOUT", "SPACE SHOOTER", "FLAPPY BIRD", "SLOT MACHINE", "BLACKJACK", "EXIT"];

    setTextSize(1);
    setTextColor(WHITE);
    drawString("SELECT GAME", 10, 5);
    drawString("M5: CONFIRM", 160, 5);

    setTextColor(WHITE);
    drawString("Msi Development", 70, 10);

    var startY = 75;
    var itemHeight = 14;

    if (mainMenuSelection >= mainMenuScroll + MENU_VISIBLE_ITEMS) {
        mainMenuScroll = mainMenuSelection - MENU_VISIBLE_ITEMS + 1;
    } else if (mainMenuSelection < mainMenuScroll) {
        mainMenuScroll = mainMenuSelection;
    }

    for (var i = 0; i < menuItems.length; i++) {
        if (i < mainMenuScroll || i >= mainMenuScroll + MENU_VISIBLE_ITEMS) {
            continue;
        }

        var displayIdx = i - mainMenuScroll;

        if (i === mainMenuSelection) {
            setTextColor(GREEN);
            drawFillRect(55, startY + displayIdx * itemHeight, 130, 12, BLUE);
        } else {
            setTextColor(WHITE);
        }

        drawString(menuItems[i], 70, startY + 5 + displayIdx * itemHeight);
    }

    if (mainMenuScroll > 0) {
        drawString("▲", WIDTH / 2, startY - 10);
    }

    if (mainMenuScroll + MENU_VISIBLE_ITEMS < menuItems.length) {
        drawString("▼", WIDTH / 2, startY + MENU_VISIBLE_ITEMS * itemHeight + 5);
    }
}

function drawExitConfirm() {
    fillScreen(BLACK);

    setTextSize(2);
    setTextColor(RED);
    drawString("EXIT GAME?", 70, 40);

    var menuItems = ["NO", "YES"];

    for (var i = 0; i < menuItems.length; i++) {
        if (i === confirmSelection) {
            setTextColor(YELLOW);
            drawFillRect(95, 75 + i * 20, 50, 15, BLUE);
        } else {
            setTextColor(WHITE);
        }

        setTextSize(1);
        drawString(menuItems[i], 110, 80 + i * 20);
    }

    setTextSize(1);
    setTextColor(WHITE);
    drawString("<- or ->: SELECT", 10, 125);
    drawString("M5: CONFIRM", 150, 125);
}

function handleMainMenu() {
    if (exitConfirm) {
        if (getPrevPress()) {
            confirmSelection = 0;
        } else if (getNextPress()) {
            confirmSelection = 1;
        } else if (getSelPress()) {
            if (confirmSelection === 0) {
                exitConfirm = false;
            } else {
                gameState = STATE_EXIT;
            }
        }
        return;
    }

    if (getPrevPress()) {
        mainMenuSelection = (mainMenuSelection + 6) % 7;
    } else if (getNextPress()) {
        mainMenuSelection = (mainMenuSelection + 1) % 7;
    } else if (getSelPress()) {
        switch (mainMenuSelection) {
            case 0:
                resetSnakeGame();
                gameState = STATE_SNAKE_GAME;
                break;
            case 1:
                resetBreakoutGame();
                gameState = STATE_BREAKOUT_MENU;
                break;
            case 2:
                resetSpaceGame();
                gameState = STATE_SPACE_MENU;
                break;
            case 3:
                resetFlappyGame();
                gameState = STATE_FLAPPY_MENU;
                break;
            case 4:
                resetSlotGame();
                gameState = STATE_SLOT_MENU;
                break;
            case 5:
                setupBlackjack();
                gameState = STATE_BLACKJACK_MENU;
                break;
            case 6:
                exitConfirm = true;
                confirmSelection = 0;
                break;
        }
    }
}

var snake = [];
var direction = 0;
var nextDirection = 0;
var food = { x: 0, y: 0 };
var snakeScore = 0;
var snakeHighScore = 0;
var snakeSpeed = 10;
var speedIncrease = true;
var FOOD_SIZE = 12;
var pauseMenuSelection = 0;
var snakeGameStarted = false;

function resetSnakeGame() {
    snake = [
        { x: 5, y: Math.floor(ROWS / 2) },
        { x: 4, y: Math.floor(ROWS / 2) },
        { x: 3, y: Math.floor(ROWS / 2) }
    ];

    direction = 0;
    nextDirection = 0;
    snakeScore = 0;

    placeFood();

    isPaused = false;
    pauseMenuSelection = 0;
    snakeGameStarted = true;
}

function placeFood() {
    var validPos = false;
    var safeMargin = 2;

    while (!validPos) {
        food.x = Math.floor(Math.random() * (COLS - 2 * safeMargin)) + safeMargin;
        food.y = Math.floor(Math.random() * (ROWS - 2 * safeMargin)) + safeMargin;

        validPos = true;
        for (var i = 0; i < snake.length; i++) {
            if (snake[i].x === food.x && snake[i].y === food.y) {
                validPos = false;
                break;
            }
        }
    }
}

function drawSnakeGame() {
    fillScreen(BLACK);

    drawSnake();
    drawFood();
    drawSnakeScore();

    if (isPaused) {
        drawSnakePause();
    }
}

function drawSnakeOver() {
    fillScreen(BLACK);

    setTextSize(3);
    setTextColor(RED);
    drawString("GAME OVER", 50, 30);

    setTextSize(2);
    setTextColor(WHITE);
    drawString("SCORE: " + snakeScore, 80, 60);

    if (snakeScore > snakeHighScore) {
        setTextColor(YELLOW);
        drawString("NEW HIGH SCORE!", 40, 85);
    }

    setTextSize(1);
    setTextColor(WHITE);
    drawString("M5: BACK TO MENU", 70, 110);
}

function drawSnake() {
    for (var i = 0; i < snake.length; i++) {
        var color = (i === 0) ? YELLOW : GREEN;

        drawFillRect(
            snake[i].x * GRID_SIZE,
            snake[i].y * GRID_SIZE,
            GRID_SIZE - 1,
            GRID_SIZE - 1,
            color
        );

        if (i === 0) {
            var eyeSize = 2;
            var eyeOffset = 2;

            var eyeX1, eyeY1, eyeX2, eyeY2;

            if (direction === 0) {
                eyeX1 = snake[i].x * GRID_SIZE + GRID_SIZE - eyeOffset;
                eyeY1 = snake[i].y * GRID_SIZE + eyeOffset;
                eyeX2 = snake[i].x * GRID_SIZE + GRID_SIZE - eyeOffset;
                eyeY2 = snake[i].y * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize;
            } else if (direction === 1) {
                eyeX1 = snake[i].x * GRID_SIZE + eyeOffset;
                eyeY1 = snake[i].y * GRID_SIZE + GRID_SIZE - eyeOffset;
                eyeX2 = snake[i].x * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize;
                eyeY2 = snake[i].y * GRID_SIZE + GRID_SIZE - eyeOffset;
            } else if (direction === 2) {
                eyeX1 = snake[i].x * GRID_SIZE + eyeOffset;
                eyeY1 = snake[i].y * GRID_SIZE + eyeOffset;
                eyeX2 = snake[i].x * GRID_SIZE + eyeOffset;
                eyeY2 = snake[i].y * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize;
            } else {
                eyeX1 = snake[i].x * GRID_SIZE + eyeOffset;
                eyeY1 = snake[i].y * GRID_SIZE + eyeOffset;
                eyeX2 = snake[i].x * GRID_SIZE + GRID_SIZE - eyeOffset - eyeSize;
                eyeY2 = snake[i].y * GRID_SIZE + eyeOffset;
            }

            drawFillRect(eyeX1, eyeY1, eyeSize, eyeSize, BLACK);
            drawFillRect(eyeX2, eyeY2, eyeSize, eyeSize, BLACK);
        }
    }
}

function drawFood() {
    drawFillRect(
        food.x * GRID_SIZE - 1,
        food.y * GRID_SIZE - 1,
        FOOD_SIZE,
        FOOD_SIZE,
        RED
    );

    drawFillRect(
        food.x * GRID_SIZE + GRID_SIZE / 2 - 1,
        food.y * GRID_SIZE - 3,
        3,
        3,
        GREEN
    );
}

function drawSnakeScore() {
    setTextSize(1);
    setTextColor(WHITE);
    drawString("SCORE: " + snakeScore, 5, 5);
    drawString("HIGH: " + snakeHighScore, 150, 5);
}

function drawSnakePause() {
    setTextSize(2);
    setTextColor(WHITE);
    drawString("PAUSED", 80, 40);

    setTextSize(1);

    var options = ["CONTINUE", "MAIN MENU", "EXIT"];

    for (var i = 0; i < options.length; i++) {
        if (i === pauseMenuSelection) {
            setTextColor(YELLOW);
            drawFillRect(70, 60 + i * 15, 100, 12, BLUE);
        } else {
            setTextColor(WHITE);
        }
        drawString(options[i], 85, 65 + i * 15);
    }

    setTextColor(WHITE);
    drawString("<- or ->: SELECT", 10, 120);
    drawString("M5: CONFIRM", 150, 120);
}

function updateSnakeGame() {
    if (isPaused || !snakeGameStarted) return;

    frameCounter++;

    var currentSpeed = speedIncrease ?
        Math.max(5, 10 - Math.floor(snake.length / 5)) : snakeSpeed;

    if (frameCounter % currentSpeed !== 0) return;

    direction = nextDirection;

    var head = { x: snake[0].x, y: snake[0].y };

    if (direction === 0) head.x++;
    else if (direction === 1) head.y++;
    else if (direction === 2) head.x--;
    else if (direction === 3) head.y--;

    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
        snakeGameOver();
        return;
    }

    for (var i = 0; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            snakeGameOver();
            return;
        }
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        snakeScore += 10;

        if (snakeScore > snakeHighScore) {
            snakeHighScore = snakeScore;
        }

        placeFood();
    } else {
        snake.pop();
    }
}

function snakeGameOver() {
    gameState = STATE_SNAKE_OVER;
    snakeGameStarted = false;
}

function handleSnakeGame() {
    if (isPaused) {
        if (getPrevPress()) {
            pauseMenuSelection = (pauseMenuSelection + 2) % 3;
        } else if (getNextPress()) {
            pauseMenuSelection = (pauseMenuSelection + 1) % 3;
        } else if (getSelPress()) {
            switch (pauseMenuSelection) {
                case 0:
                    isPaused = false;
                    break;
                case 1:
                    gameState = STATE_MAIN_MENU;
                    break;
                case 2:
                    exitConfirm = true;
                    confirmSelection = 0;
                    break;
            }
        }
        return;
    }

    if (getSelPress()) {
        isPaused = true;
        pauseMenuSelection = 0;
        return;
    }

    if (getPrevPress()) {
        if (!(direction === 0 && nextDirection === 2) &&
            !(direction === 2 && nextDirection === 0) &&
            !(direction === 1 && nextDirection === 3) &&
            !(direction === 3 && nextDirection === 1)) {
            nextDirection = (direction + 3) % 4;
        }
    } else if (getNextPress()) {
        if (!(direction === 0 && nextDirection === 2) &&
            !(direction === 2 && nextDirection === 0) &&
            !(direction === 1 && nextDirection === 3) &&
            !(direction === 3 && nextDirection === 1)) {
            nextDirection = (direction + 1) % 4;
        }
    }
}

function handleSnakeOver() {
    if (getSelPress()) {
        gameState = STATE_MAIN_MENU;
    }
}

var PADDLE_WIDTH = 40;
var PADDLE_HEIGHT = 6;
var BALL_SIZE = 5;
var BRICK_WIDTH = 20;
var BRICK_HEIGHT = 10;
var BRICK_MARGIN = 2;
var BRICK_ROWS = 5;
var BRICK_COLS = 10;
var BRICK_COLORS = [RED, ORANGE, YELLOW, GREEN, BLUE, PURPLE];

var paddle = {
    x: WIDTH / 2 - PADDLE_WIDTH / 2,
    y: HEIGHT - 15,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
    speed: 12,
    color: WHITE
};

var ball = {
    x: WIDTH / 2,
    y: HEIGHT - 20 - BALL_SIZE,
    size: BALL_SIZE,
    speedX: 0,
    speedY: 0,
    color: WHITE,
    stuck: true
};

var bricks = [];
var breakoutScore = 0;
var breakoutLives = 3;
var breakoutLevel = 1;
var totalBricks = 0;

function resetBreakoutGame() {
    paddle.x = WIDTH / 2 - PADDLE_WIDTH / 2;
    ball.x = paddle.x + paddle.width / 2;
    ball.y = paddle.y - ball.size;
    ball.stuck = true;

    resetBall();

    breakoutScore = 0;
    breakoutLives = 3;
    breakoutLevel = 1;

    createBricks();
}

function resetBall() {
    ball.speedX = (Math.random() * 2 - 1) * 2;
    ball.speedY = -3;
}

function createBricks() {
    bricks = [];

    for (var i = 0; i < BRICK_ROWS; i++) {
        for (var j = 0; j < BRICK_COLS; j++) {
            var colorIndex = i % BRICK_COLORS.length;

            var strength = 1;
            if (Math.random() < 0.1 * breakoutLevel) {
                strength = 2;
            }

            bricks.push({
                x: j * (BRICK_WIDTH + BRICK_MARGIN) + 10,
                y: i * (BRICK_HEIGHT + BRICK_MARGIN) + 20,
                width: BRICK_WIDTH,
                height: BRICK_HEIGHT,
                color: BRICK_COLORS[colorIndex],
                strength: strength,
                hit: false
            });
        }
    }

    totalBricks = bricks.length;
}

function breakoutNextLevel() {
    breakoutLevel++;
    paddle.width = Math.max(PADDLE_WIDTH - (breakoutLevel - 1) * 3, 20);
    resetBall();
    ball.stuck = true;
    gameState = STATE_BREAKOUT_NEXT;
}

function drawBreakoutMenu() {
    fillScreen(BLACK);

    setTextSize(2);
    setTextColor(YELLOW);
    drawString("BREAKOUT", 75, 30);

    setTextSize(1);
    setTextColor(WHITE);
    drawString("<-: LEFT", 65, 60);
    drawString("->: RIGHT", 65, 75);
    drawString("M5: RELEASE BALL", 65, 90);

    setTextColor(GREEN);
    drawString("M5: START GAME", 65, 115);
}

function drawBreakoutGame() {
    fillScreen(BLACK);

    setTextSize(1);
    setTextColor(WHITE);
    drawString("SCORE: " + breakoutScore, 10, 5);
    drawString("LEVEL: " + breakoutLevel, 100, 5);

    drawString("LIVES:", 180, 5);
    for (var i = 0; i < breakoutLives; i++) {
        drawFillRect(215 + i * 8, 5, 5, 5, RED);
    }

    for (var i = 0; i < bricks.length; i++) {
        var brick = bricks[i];
        if (!brick.hit) {
            drawFillRect(brick.x, brick.y, brick.width, brick.height, brick.color);

            if (brick.strength > 1) {
                drawRect(brick.x + 2, brick.y + 2, brick.width - 4, brick.height - 4, WHITE);
            }
        }
    }

    drawFillRect(paddle.x, paddle.y, paddle.width, paddle.height, paddle.color);

    drawFillRect(ball.x - ball.size / 2, ball.y - ball.size / 2, ball.size, ball.size, ball.color);

    if (isPaused) {
        drawBreakoutPause();
    }
}

function drawBreakoutPause() {
    setTextSize(2);
    setTextColor(WHITE);
    drawString("PAUSED", 80, 40);

    setTextSize(1);

    var options = ["CONTINUE", "MAIN MENU", "EXIT"];

    for (var i = 0; i < options.length; i++) {
        if (i === pauseMenuSelection) {
            setTextColor(YELLOW);
            drawFillRect(70, 60 + i * 15, 100, 12, BLUE);
        } else {
            setTextColor(WHITE);
        }
        drawString(options[i], 85, 65 + i * 15);
    }

    setTextColor(WHITE);
    drawString("<- or ->: SELECT", 10, 120);
    drawString("M5: CONFIRM", 150, 120);
}

function drawBreakoutOver() {
    fillScreen(BLACK);

    setTextSize(2);
    setTextColor(RED);
    drawString("GAME OVER", 65, 40);

    setTextSize(1);
    setTextColor(WHITE);
    drawString("SCORE: " + breakoutScore, 90, 65);

    setTextColor(YELLOW);
    drawString("M5: BACK TO MENU", 70, 90);
}

function drawBreakoutWin() {
    fillScreen(BLACK);

    setTextSize(2);
    setTextColor(GREEN);
    drawString("YOU WIN!", 70, 40);

    setTextSize(1);
    setTextColor(WHITE);
    drawString("SCORE: " + breakoutScore, 90, 65);

    setTextColor(YELLOW);
    drawString("M5: BACK TO MENU", 70, 90);
}

function drawBreakoutNext() {
    fillScreen(BLACK);

    setTextSize(2);
    setTextColor(YELLOW);
    drawString("LEVEL " + breakoutLevel, 80, 40);

    setTextSize(1);
    setTextColor(GREEN);
    drawString("CONGRATULATIONS!", 65, 65);

    setTextColor(WHITE);
    drawString("M5: CONTINUE", 80, 90);
}

function updateBreakoutGame() {
    if (isPaused) return;

    if (getPrevPress()) {
        paddle.x -= paddle.speed;
    } else if (getNextPress()) {
        paddle.x += paddle.speed;
    }

    if (paddle.x < 0) {
        paddle.x = 0;
    }
    if (paddle.x + paddle.width > WIDTH) {
        paddle.x = WIDTH - paddle.width;
    }

    if (ball.stuck) {
        ball.x = paddle.x + paddle.width / 2;
        ball.y = paddle.y - ball.size;
        return;
    }

    ball.x += ball.speedX;
    ball.y += ball.speedY;

    if (ball.x - ball.size / 2 < 0 || ball.x + ball.size / 2 > WIDTH) {
        ball.speedX = -ball.speedX;
    }
    if (ball.y - ball.size / 2 < 0) {
        ball.speedY = -ball.speedY;
    }

    if (ball.y + ball.size / 2 > HEIGHT) {
        breakoutLives--;

        if (breakoutLives <= 0) {
            gameState = STATE_BREAKOUT_OVER;
        } else {
            ball.stuck = true;
        }

        return;
    }

    if (ball.y + ball.size / 2 > paddle.y - 2 &&
        ball.y - ball.size / 2 < paddle.y + paddle.height &&
        ball.x + ball.size / 2 > paddle.x &&
        ball.x - ball.size / 2 < paddle.x + paddle.width) {

        var hitPos = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);

        ball.speedX = hitPos * 4;
        ball.speedY = -Math.abs(ball.speedY) * 1.05;
    }

    var bricksHit = 0;
    for (var i = 0; i < bricks.length; i++) {
        var brick = bricks[i];

        if (!brick.hit &&
            ball.x + ball.size / 2 > brick.x &&
            ball.x - ball.size / 2 < brick.x + brick.width &&
            ball.y + ball.size / 2 > brick.y &&
            ball.y - ball.size / 2 < brick.y + brick.height) {

            brick.strength--;

            if (brick.strength <= 0) {
                brick.hit = true;
                breakoutScore += 10 * breakoutLevel;
                bricksHit++;
            } else {
                breakoutScore += 5;
            }

            var overlapLeft = ball.x + ball.size / 2 - brick.x;
            var overlapRight = brick.x + brick.width - (ball.x - ball.size / 2);
            var overlapTop = ball.y + ball.size / 2 - brick.y;
            var overlapBottom = brick.y + brick.height - (ball.y - ball.size / 2);

            var minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

            if (minOverlap === overlapLeft || minOverlap === overlapRight) {
                ball.speedX = -ball.speedX;
            } else {
                ball.speedY = -ball.speedY;
            }

            break;
        }
    }

    var remainingBricks = 0;
    for (var i = 0; i < bricks.length; i++) {
        if (!bricks[i].hit) {
            remainingBricks++;
        }
    }

    if (remainingBricks === 0) {
        if (breakoutLevel < 5) {
            breakoutNextLevel();
        } else {
            gameState = STATE_BREAKOUT_WIN;
        }
    }
}

function handleBreakoutMenu() {
    if (getSelPress()) {
        resetBreakoutGame();
        gameState = STATE_BREAKOUT_GAME;
    }
}

function handleBreakoutGame() {
    if (isPaused) {
        if (getPrevPress()) {
            pauseMenuSelection = (pauseMenuSelection + 2) % 3;
        } else if (getNextPress()) {
            pauseMenuSelection = (pauseMenuSelection + 1) % 3;
        } else if (getSelPress()) {
            switch (pauseMenuSelection) {
                case 0:
                    isPaused = false;
                    break;
                case 1:
                    gameState = STATE_MAIN_MENU;
                    break;
                case 2:
                    exitConfirm = true;
                    confirmSelection = 0;
                    break;
            }
        }
        return;
    }

    if (getSelPress()) {
        if (ball.stuck) {
            ball.stuck = false;
        } else {
            isPaused = true;
            pauseMenuSelection = 0;
        }
    }
}

function handleBreakoutOver() {
    if (getSelPress()) {
        gameState = STATE_MAIN_MENU;
    }
}

function handleBreakoutWin() {
    if (getSelPress()) {
        gameState = STATE_MAIN_MENU;
    }
}

function handleBreakoutNext() {
    if (getSelPress()) {
        createBricks();
        gameState = STATE_BREAKOUT_GAME;
    }
}

var PLAYER_SIZE = 16;
var ENEMY_SIZE = 14;
var BULLET_SIZE = 5;
var POWERUP_SIZE = 10;
var EXPLOSION_MAX_SIZE = 22;

var spacePlayer = {
    x: WIDTH / 2,
    y: HEIGHT - 25,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    speed: 4,
    lives: 3,
    weaponLevel: 1,
    weaponTime: 0,
    invincible: false,
    invincibleTime: 0,
    lastX: 0,
    lastY: 0
};

var bullets = [];
var enemies = [];
var enemyBullets = [];
var explosions = [];
var stars = [];
var powerups = [];
var spaceScore = 0;
var spaceHighScore = 0;
var spaceLevel = 1;
var enemySpawnRate = 50;
var enemyShootRate = 150;
var bossActive = false;
var boss = null;
var killCount = 0;
var levelUpThreshold = 20;
var fireRate = 8;
var lastFireTime = 0;
var spaceLongPress = false;

var enemyTypes = [
    { color: RED, detailColor: DARKRED, health: 1, speed: 0.5, points: 10, shootRate: 0, shape: "triangle" },
    { color: BLUE, detailColor: DARKBLUE, health: 2, speed: 0.7, points: 20, shootRate: 150, shape: "square" },
    { color: PURPLE, detailColor: MAGENTA, health: 1, speed: 0.9, points: 15, shootRate: 0, shape: "diamond" },
    { color: ORANGE, detailColor: YELLOW, health: 3, speed: 0.4, points: 30, shootRate: 120, shape: "circle" }
];

var powerupTypes = [
    { type: "weapon", color: YELLOW, duration: 300 },
    { type: "life", color: GREEN, duration: 0 }
];

function resetSpaceGame() {
    spacePlayer.x = WIDTH / 2;
    spacePlayer.y = HEIGHT - 25;
    spacePlayer.lives = 3;
    spacePlayer.weaponLevel = 1;
    spacePlayer.weaponTime = 0;
    spacePlayer.invincible = false;
    spacePlayer.invincibleTime = 0;
    spacePlayer.lastX = spacePlayer.x;
    spacePlayer.lastY = spacePlayer.y;

    bullets = [];
    enemies = [];
    enemyBullets = [];
    explosions = [];
    powerups = [];
    boss = null;

    spaceScore = 0;
    spaceLevel = 1;
    frameCounter = 0;
    enemySpawnRate = 50;
    enemyShootRate = 150;
    bossActive = false;
    killCount = 0;
    lastFireTime = 0;
    spaceLongPress = false;

    createStars();
}

function createStars() {
    stars = [];
    for (var i = 0; i < 60; i++) {
        stars.push({
            x: Math.random() * WIDTH,
            y: Math.random() * HEIGHT,
            size: Math.random() * 2.5 + 1,
            speed: Math.random() * 0.8 + 0.3,
            lastX: Math.random() * WIDTH,
            lastY: Math.random() * HEIGHT
        });
    }
}

function drawSpaceMenu() {
    fillScreen(BLACK);

    setTextSize(3);
    setTextColor(CYAN);
    drawString("SPACE", 75, 25);
    setTextColor(ORANGE);
    drawString("SHOOTER", 60, 50);

    setTextSize(1);
    setTextColor(WHITE);
    drawString("<-: LEFT", 20, 85);
    drawString("->: RIGHT", 150, 85);
    drawString("M5: FIRE", 20, 100);
    drawString("PREV: PAUSE MENU", 130, 100);

    setTextColor(GREEN);
    drawString("M5: START GAME", 75, 130);
}

function drawSpaceGame() {
    fillScreen(BLACK);

    drawStars();
    drawSpacePlayer();
    drawEnemies();
    drawBullets();
    drawEnemyBullets();
    drawExplosions();
    drawPowerups();
    drawSpaceHUD();

    if (isPaused) {
        drawSpacePause();
    }
}

function drawSpaceOver() {
    fillScreen(BLACK);

    drawStars();

    setTextSize(3);
    setTextColor(RED);
    drawString("GAME OVER", 50, 30);

    setTextSize(2);
    setTextColor(WHITE);
    drawString("SCORE: " + spaceScore, 80, 60);

    if (spaceScore > spaceHighScore) {
        setTextColor(YELLOW);
        drawString("NEW HIGH SCORE!", 40, 85);
    }

    setTextSize(1);
    setTextColor(WHITE);
    drawString("M5: BACK TO MENU", 70, 110);
}

function drawSpaceLevel() {
    fillScreen(BLACK);

    drawStars();

    setTextSize(2);
    setTextColor(GREEN);
    drawString("LEVEL " + spaceLevel, 80, 40);

    setTextSize(1);
    setTextColor(YELLOW);
    drawString("BONUS: " + (spaceLevel * 100), 85, 65);

    setTextColor(WHITE);
    drawString("M5: CONTINUE", 80, 90);
}

function drawSpacePause() {
    setTextSize(2);
    setTextColor(CYAN);
    drawString("PAUSED", 80, 40);

    setTextSize(1);

    var options = ["CONTINUE", "MAIN MENU", "EXIT"];

    for (var i = 0; i < options.length; i++) {
        if (i === pauseMenuSelection) {
            setTextColor(YELLOW);
            drawFillRect(70, 60 + i * 15, 100, 12, BLUE);
        } else {
            setTextColor(WHITE);
        }
        drawString(options[i], 85, 65 + i * 15);
    }

    setTextColor(WHITE);
    drawString("<- or ->: SELECT", 10, 120);
    drawString("M5: CONFIRM", 150, 120);
}

function drawSpacePlayer() {
    drawFillRect(spacePlayer.x - spacePlayer.width / 2, spacePlayer.y, spacePlayer.width, spacePlayer.height, BLUE);

    drawFillRect(spacePlayer.x - spacePlayer.width / 2 + 3, spacePlayer.y + 3, spacePlayer.width - 6, spacePlayer.height - 8, CYAN);

    drawFillRect(spacePlayer.x - 4, spacePlayer.y - 5, 8, 5, WHITE);

    if (frameCounter % 6 < 3) {
        drawFillRect(spacePlayer.x - 6, spacePlayer.y + spacePlayer.height, 12, 4, ORANGE);
        drawFillRect(spacePlayer.x - 4, spacePlayer.y + spacePlayer.height + 4, 8, 3, YELLOW);
    } else {
        drawFillRect(spacePlayer.x - 5, spacePlayer.y + spacePlayer.height, 10, 5, ORANGE);
        drawFillRect(spacePlayer.x - 3, spacePlayer.y + spacePlayer.height + 3, 6, 2, YELLOW);
    }

    if (spacePlayer.weaponLevel > 1) {
        drawFillRect(spacePlayer.x - spacePlayer.width / 2 - 4, spacePlayer.y + 3, 4, 4, YELLOW);
        drawFillRect(spacePlayer.x + spacePlayer.width / 2, spacePlayer.y + 3, 4, 4, YELLOW);

        drawFillRect(spacePlayer.x - spacePlayer.width / 2 - 2, spacePlayer.y + 5, 2, 6, RED);
        drawFillRect(spacePlayer.x + spacePlayer.width / 2 + 1, spacePlayer.y + 5, 2, 6, RED);
    }

    if (spacePlayer.weaponLevel > 2) {
        drawFillRect(spacePlayer.x - spacePlayer.width / 2 - 4, spacePlayer.y + 10, 4, 4, YELLOW);
        drawFillRect(spacePlayer.x + spacePlayer.width / 2, spacePlayer.y + 10, 4, 4, YELLOW);
    }

    if (spacePlayer.invincible && frameCounter % 6 < 3) {
        drawRect(spacePlayer.x - spacePlayer.width / 2 - 2, spacePlayer.y - 2, spacePlayer.width + 4, spacePlayer.height + 4, WHITE);
    }
}

function drawEnemies() {
    for (var i = 0; i < enemies.length; i++) {
        var enemy = enemies[i];

        if (enemy.isBoss) {
            drawBoss(enemy);
        } else {
            if (enemy.shape === "triangle") {
                drawFillRect(enemy.x - enemy.width / 2, enemy.y - enemy.height / 2, enemy.width, enemy.height, enemy.color);

                drawLine(enemy.x - enemy.width / 2, enemy.y + enemy.height / 2,
                    enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.detailColor);
                drawLine(enemy.x - enemy.width / 2, enemy.y + enemy.height / 2,
                    enemy.x, enemy.y - enemy.height / 2, enemy.detailColor);
                drawLine(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2,
                    enemy.x, enemy.y - enemy.height / 2, enemy.detailColor);

                drawFillRect(enemy.x - 2, enemy.y, 4, 3, WHITE);
            }
            else if (enemy.shape === "square") {
                drawFillRect(enemy.x - enemy.width / 2, enemy.y - enemy.height / 2, enemy.width, enemy.height, enemy.color);

                drawRect(enemy.x - enemy.width / 2 + 2, enemy.y - enemy.height / 2 + 2,
                    enemy.width - 4, enemy.height - 4, enemy.detailColor);

                drawFillRect(enemy.x - enemy.width / 4, enemy.y - 2, 3, 3, WHITE);
                drawFillRect(enemy.x + enemy.width / 4 - 3, enemy.y - 2, 3, 3, WHITE);
            }
            else if (enemy.shape === "diamond") {
                drawFillRect(enemy.x - enemy.width / 2, enemy.y - enemy.height / 2, enemy.width, enemy.height, enemy.color);

                drawLine(enemy.x - enemy.width / 2, enemy.y,
                    enemy.x, enemy.y - enemy.height / 2, enemy.detailColor);
                drawLine(enemy.x, enemy.y - enemy.height / 2,
                    enemy.x + enemy.width / 2, enemy.y, enemy.detailColor);
                drawLine(enemy.x + enemy.width / 2, enemy.y,
                    enemy.x, enemy.y + enemy.height / 2, enemy.detailColor);
                drawLine(enemy.x, enemy.y + enemy.height / 2,
                    enemy.x - enemy.width / 2, enemy.y, enemy.detailColor);

                drawFillRect(enemy.x - 2, enemy.y - 2, 4, 4, WHITE);
            }
            else if (enemy.shape === "circle") {
                drawFillRect(enemy.x - enemy.width / 2, enemy.y - enemy.height / 2, enemy.width, enemy.height, enemy.color);

                drawRect(enemy.x - enemy.width / 2 + 1, enemy.y - enemy.height / 2 + 1,
                    enemy.width - 2, enemy.height - 2, enemy.detailColor);

                drawFillRect(enemy.x - enemy.width / 2 - 3, enemy.y, 3, 3, enemy.detailColor);
                drawFillRect(enemy.x + enemy.width / 2, enemy.y, 3, 3, enemy.detailColor);
            }
        }

        if (enemy.hitFrame > 0) {
            drawFillRect(
                enemy.x - enemy.width / 2,
                enemy.y - enemy.height / 2,
                enemy.width,
                enemy.height,
                WHITE
            );
            enemy.hitFrame--;
        }
    }
}

function drawBoss(boss) {
    drawFillRect(
        boss.x - boss.width / 2,
        boss.y - boss.height / 2,
        boss.width,
        boss.height,
        RED
    );

    drawFillRect(
        boss.x - boss.width / 2 + 4,
        boss.y - boss.height / 2 + 4,
        boss.width - 8,
        boss.height - 8,
        DARKRED
    );

    drawFillRect(
        boss.x - boss.width / 4 - 3,
        boss.y - boss.height / 4,
        8,
        8,
        YELLOW
    );

    drawFillRect(
        boss.x + boss.width / 4 - 5,
        boss.y - boss.height / 4,
        8,
        8,
        YELLOW
    );

    drawFillRect(
        boss.x - boss.width / 4,
        boss.y - boss.height / 4 + 3,
        2,
        2,
        BLACK
    );

    drawFillRect(
        boss.x + boss.width / 4 - 2,
        boss.y - boss.height / 4 + 3,
        2,
        2,
        BLACK
    );

    drawFillRect(
        boss.x - boss.width / 2 - 6,
        boss.y,
        6,
        10,
        PURPLE
    );

    drawFillRect(
        boss.x + boss.width / 2,
        boss.y,
        6,
        10,
        PURPLE
    );

    drawFillRect(
        boss.x - boss.width / 2 - 4,
        boss.y + 3,
        2,
        4,
        RED
    );

    drawFillRect(
        boss.x + boss.width / 2 + 2,
        boss.y + 3,
        2,
        4,
        RED
    );

    var healthBarWidth = (boss.health / boss.maxHealth) * (WIDTH - 40);
    drawFillRect(20, 20, healthBarWidth, 5, RED);
    drawRect(20, 20, WIDTH - 40, 5, WHITE);
}

function drawBullets() {
    for (var i = 0; i < bullets.length; i++) {
        var bullet = bullets[i];

        var bulletColor = YELLOW;
        if (bullet.weaponLevel === 2) bulletColor = CYAN;
        if (bullet.weaponLevel === 3) bulletColor = MAGENTA;

        drawFillRect(
            bullet.x - bullet.width / 2,
            bullet.y - bullet.height / 2,
            bullet.width,
            bullet.height,
            bulletColor
        );

        if (bullet.weaponLevel > 1) {
            drawFillRect(
                bullet.x - bullet.width / 2,
                bullet.y + bullet.height / 2,
                bullet.width,
                3,
                WHITE
            );
        }
    }
}

function drawEnemyBullets() {
    for (var i = 0; i < enemyBullets.length; i++) {
        var bullet = enemyBullets[i];

        drawFillRect(
            bullet.x - bullet.width / 2,
            bullet.y - bullet.height / 2,
            bullet.width,
            bullet.height,
            RED
        );

        drawFillRect(
            bullet.x - bullet.width / 2,
            bullet.y - bullet.height / 2 - 3,
            bullet.width,
            3,
            ORANGE
        );
    }
}

function drawExplosions() {
    for (var i = 0; i < explosions.length; i++) {
        var explosion = explosions[i];

        var size = (explosion.life / explosion.maxLife) * explosion.maxSize;

        var color = ORANGE;
        if (explosion.life < explosion.maxLife / 3) {
            color = YELLOW;
        } else if (explosion.life < explosion.maxLife * 2 / 3) {
            color = ORANGE;
        } else {
            color = RED;
        }

        for (var j = 0; j < 4; j++) {
            var partSize = size * (0.5 + j * 0.1);
            var offsetX = Math.cos(j * Math.PI / 2 + frameCounter * 0.2) * (size / 5);
            var offsetY = Math.sin(j * Math.PI / 2 + frameCounter * 0.2) * (size / 5);

            drawFillRect(
                explosion.x - partSize / 2 + offsetX,
                explosion.y - partSize / 2 + offsetY,
                partSize,
                partSize,
                j % 2 === 0 ? color : YELLOW
            );
        }

        if (explosion.life > explosion.maxLife / 2) {
            drawFillRect(
                explosion.x - 3,
                explosion.y - 3,
                6,
                6,
                WHITE
            );
        }
    }
}

function drawPowerups() {
    for (var i = 0; i < powerups.length; i++) {
        var powerup = powerups[i];

        drawFillRect(
            powerup.x - powerup.width / 2,
            powerup.y - powerup.height / 2,
            powerup.width,
            powerup.height,
            powerup.color
        );

        if (frameCounter % 10 < 5) {
            drawRect(
                powerup.x - powerup.width / 2 + 2,
                powerup.y - powerup.height / 2 + 2,
                powerup.width - 4,
                powerup.height - 4,
                WHITE
            );
        }

        if (powerup.type === "weapon") {
            drawString("W", powerup.x - 3, powerup.y - 3);
        } else if (powerup.type === "life") {
            drawString("+", powerup.x - 3, powerup.y - 3);
        }
    }
}

function drawStars() {
    for (var i = 0; i < stars.length; i++) {
        var star = stars[i];

        var brightness = (frameCounter + i * 10) % 100;
        var color = brightness < 50 ? WHITE : CYAN;

        if (i % 7 === 0) color = YELLOW;
        if (i % 11 === 0) color = MAGENTA;

        drawFillRect(
            star.x,
            star.y,
            star.size,
            star.size,
            color
        );
    }
}

function drawSpaceHUD() {
    setTextSize(1);
    setTextColor(WHITE);
    drawString("SCORE: " + spaceScore, 5, 5);
    drawString("LEVEL: " + spaceLevel, 90, 5);

    drawString("LIVES:", 180, 5);
    for (var i = 0; i < spacePlayer.lives; i++) {
        drawFillRect(210 + i * 10, 5, 6, 6, GREEN);
    }

    if (spacePlayer.weaponTime > 0) {
        var weaponBarWidth = (spacePlayer.weaponTime / 300) * 50;
        drawFillRect(5, HEIGHT - 10, weaponBarWidth, 5, YELLOW);
        drawRect(5, HEIGHT - 10, 50, 5, WHITE);
        drawString("WEAPON: " + spacePlayer.weaponLevel, 60, HEIGHT - 9);
    }
}

function updateSpaceGame() {
    if (isPaused) return;

    frameCounter++;

    updateStars();

    updateSpacePlayer();

    updateBullets();
    updateEnemyBullets();

    if (!bossActive) {
        spawnEnemies();
    }
    updateEnemies();

    updateExplosions();

    updatePowerups();

    checkSpaceCollisions();

    checkLevelProgress();
}

function updateStars() {
    for (var i = 0; i < stars.length; i++) {
        stars[i].lastY = stars[i].y;
        stars[i].y += stars[i].speed;

        if (stars[i].y > HEIGHT) {
            stars[i].y = 0;
            stars[i].lastY = 0;
            stars[i].x = Math.random() * WIDTH;
            stars[i].lastX = stars[i].x;
        }
    }
}

function updateSpacePlayer() {
    spacePlayer.lastX = spacePlayer.x;
    spacePlayer.lastY = spacePlayer.y;

    if (spacePlayer.invincible) {
        spacePlayer.invincibleTime--;
        if (spacePlayer.invincibleTime <= 0) {
            spacePlayer.invincible = false;
        }
    }

    if (spacePlayer.weaponTime > 0) {
        spacePlayer.weaponTime--;
        if (spacePlayer.weaponTime <= 0) {
            spacePlayer.weaponLevel = 1;
        }
    }
}

function updateBullets() {
    for (var i = 0; i < bullets.length; i++) {
        bullets[i].y -= bullets[i].speed;

        if (bullets[i].y + bullets[i].height < 0) {
            bullets.splice(i, 1);
            i--;
        }
    }
}

function updateEnemyBullets() {
    for (var i = 0; i < enemyBullets.length; i++) {
        enemyBullets[i].y += enemyBullets[i].speed;

        if (enemyBullets[i].y - enemyBullets[i].height > HEIGHT) {
            enemyBullets.splice(i, 1);
            i--;
        }
    }
}

function spawnEnemies() {
    if (frameCounter % enemySpawnRate === 0) {
        var type = Math.floor(Math.random() * enemyTypes.length);
        var enemyType = enemyTypes[type];

        var enemy = {
            x: Math.random() * (WIDTH - 40) + 20,
            y: -20,
            width: ENEMY_SIZE,
            height: ENEMY_SIZE,
            type: type,
            color: enemyType.color,
            detailColor: enemyType.detailColor,
            health: enemyType.health,
            speed: enemyType.speed,
            points: enemyType.points,
            shootRate: enemyType.shootRate,
            lastShot: 0,
            hitFrame: 0,
            movePattern: Math.floor(Math.random() * 3),
            shape: enemyType.shape
        };

        enemies.push(enemy);

        if (killCount >= levelUpThreshold) {
            spawnBoss();
        }
    }
}

function spawnBoss() {
    bossActive = true;

    boss = {
        x: WIDTH / 2,
        y: 40,
        width: ENEMY_SIZE * 4,
        height: ENEMY_SIZE * 2.5,
        type: 99,
        color: RED,
        health: 25 * spaceLevel,
        maxHealth: 25 * spaceLevel,
        speed: 1.0,
        points: 750 * spaceLevel,
        shootRate: 40,
        lastShot: 0,
        hitFrame: 0,
        isBoss: true,
        phase: 0,
        phaseCounter: 0
    };

    enemies.push(boss);
}

function updateEnemies() {
    for (var i = 0; i < enemies.length; i++) {
        var enemy = enemies[i];

        if (enemy.isBoss) {
            updateBoss(enemy);
        } else {
            if (enemy.movePattern === 0) {
                enemy.y += enemy.speed * 1.2;
            } else if (enemy.movePattern === 1) {
                enemy.y += enemy.speed;
                enemy.x += Math.sin(frameCounter * 0.10) * enemy.speed * 0.8;
            } else if (enemy.movePattern === 2) {
                enemy.y += enemy.speed;
                enemy.x += Math.cos(enemy.y * 0.03) * enemy.speed * 1.3;
            }

            if (enemy.shootRate > 0 && frameCounter - enemy.lastShot > enemy.shootRate) {
                enemyShoot(enemy);
                enemy.lastShot = frameCounter;
            }
        }

        if (enemy.y - enemy.height > HEIGHT) {
            enemies.splice(i, 1);
            i--;
        }
    }
}

function updateBoss(boss) {
    boss.phaseCounter++;

    if (boss.phase === 0) {
        boss.x += Math.sin(frameCounter * 0.03) * 2;

        if (frameCounter % 30 === 0) {
            for (var i = -1; i <= 1; i++) {
                var bullet = {
                    x: boss.x + (i * 20),
                    y: boss.y + boss.height / 2,
                    width: BULLET_SIZE + 1,
                    height: BULLET_SIZE * 2,
                    speed: 2.0,
                    damage: 1
                };
                enemyBullets.push(bullet);
            }
        }

        if (boss.phaseCounter > 180) {
            boss.phase = 1;
            boss.phaseCounter = 0;
        }
    } else if (boss.phase === 1) {
        var targetX = spacePlayer.x;
        boss.x += (targetX - boss.x) * 0.02;

        if (frameCounter % 15 === 0) {
            var bullet = {
                x: boss.x,
                y: boss.y + boss.height / 2,
                width: BULLET_SIZE + 2,
                height: BULLET_SIZE * 3,
                speed: 3,
                damage: 1
            };
            enemyBullets.push(bullet);
        }

        if (boss.phaseCounter > 120) {
            boss.phase = 2;
            boss.phaseCounter = 0;
        }
    } else if (boss.phase === 2) {
        boss.x += Math.sin(frameCounter * 0.05) * 3;

        if (frameCounter % 60 === 0) {
            for (var i = -3; i <= 3; i++) {
                var bullet = {
                    x: boss.x + (i * 12),
                    y: boss.y + boss.height / 2,
                    width: BULLET_SIZE,
                    height: BULLET_SIZE * 2,
                    speed: 1.5 + Math.abs(i) * 0.3,
                    damage: 1
                };
                enemyBullets.push(bullet);
            }
        }

        if (boss.phaseCounter > 220) {
            boss.phase = 0;
            boss.phaseCounter = 0;
        }
    }
}

function updateExplosions() {
    for (var i = 0; i < explosions.length; i++) {
        explosions[i].life--;

        if (explosions[i].life <= 0) {
            explosions.splice(i, 1);
            i--;
        }
    }
}

function updatePowerups() {
    for (var i = 0; i < powerups.length; i++) {
        powerups[i].y += 1.5;
        powerups[i].x += Math.sin(frameCounter * 0.1 + i) * 0.5;

        if (powerups[i].y > HEIGHT) {
            powerups.splice(i, 1);
            i--;
        }
    }
}

function checkSpaceCollisions() {
    for (var i = 0; i < bullets.length; i++) {
        var bullet = bullets[i];

        for (var j = 0; j < enemies.length; j++) {
            var enemy = enemies[j];

            if (checkRectCollision(
                bullet.x - bullet.width / 2, bullet.y - bullet.height / 2, bullet.width, bullet.height,
                enemy.x - enemy.width / 2, enemy.y - enemy.height / 2, enemy.width, enemy.height
            )) {
                enemy.health -= bullet.damage;
                enemy.hitFrame = 3;

                createExplosion(bullet.x, bullet.y, EXPLOSION_MAX_SIZE / 3);

                bullets.splice(i, 1);
                i--;

                if (enemy.health <= 0) {
                    spaceScore += enemy.points;

                    if (!enemy.isBoss) {
                        killCount++;
                    }

                    if (Math.random() < 0.12 || enemy.isBoss) {
                        spawnPowerup(enemy.x, enemy.y);
                    }

                    var explosionSize = enemy.isBoss ? EXPLOSION_MAX_SIZE * 3 : EXPLOSION_MAX_SIZE;
                    createExplosion(enemy.x, enemy.y, explosionSize);

                    enemies.splice(j, 1);
                    j--;

                    if (enemy.isBoss) {
                        bossActive = false;
                        spaceLevelUp();
                    }
                }

                break;
            }
        }
    }

    if (!spacePlayer.invincible) {
        for (var i = 0; i < enemyBullets.length; i++) {
            var bullet = enemyBullets[i];

            if (checkRectCollision(
                bullet.x - bullet.width / 2, bullet.y - bullet.height / 2, bullet.width, bullet.height,
                spacePlayer.x - spacePlayer.width / 2, spacePlayer.y - spacePlayer.height / 2, spacePlayer.width, spacePlayer.height
            )) {
                enemyBullets.splice(i, 1);
                i--;

                spacePlayerHit();

                break;
            }
        }
    }

    if (!spacePlayer.invincible) {
        for (var i = 0; i < enemies.length; i++) {
            var enemy = enemies[i];

            if (checkRectCollision(
                enemy.x - enemy.width / 2, enemy.y - enemy.height / 2, enemy.width, enemy.height,
                spacePlayer.x - spacePlayer.width / 2, spacePlayer.y - spacePlayer.height / 2, spacePlayer.width, spacePlayer.height
            )) {
                spacePlayerHit();
                enemy.health = 0;
                createExplosion(enemy.x, enemy.y, EXPLOSION_MAX_SIZE);

                enemies.splice(i, 1);
                i--;
            }
        }
    }

    for (var i = 0; i < powerups.length; i++) {
        var powerup = powerups[i];

        if (checkRectCollision(
            powerup.x - powerup.width / 2, powerup.y - powerup.height / 2, powerup.width, powerup.height,
            spacePlayer.x - spacePlayer.width / 2, spacePlayer.y - spacePlayer.height / 2, spacePlayer.width, spacePlayer.height
        )) {
            if (powerup.type === "weapon") {
                spacePlayer.weaponLevel = Math.min(3, spacePlayer.weaponLevel + 1);
                spacePlayer.weaponTime = powerup.duration;
            } else if (powerup.type === "life") {
                spacePlayer.lives = Math.min(5, spacePlayer.lives + 1);
            }

            spaceScore += 50;

            powerups.splice(i, 1);
            i--;

            createExplosion(powerup.x, powerup.y, EXPLOSION_MAX_SIZE / 2);
        }
    }
}

function spacePlayerHit() {
    spacePlayer.lives--;

    spacePlayer.invincible = true;
    spacePlayer.invincibleTime = 60;

    createExplosion(spacePlayer.x, spacePlayer.y, EXPLOSION_MAX_SIZE);

    if (spacePlayer.lives <= 0) {
        gameState = STATE_SPACE_OVER;

        if (spaceScore > spaceHighScore) {
            spaceHighScore = spaceScore;
        }
    }
}

function checkLevelProgress() {
    if (!bossActive && killCount >= levelUpThreshold) {
        spawnBoss();
    }
}

function spaceLevelUp() {
    spaceLevel++;
    killCount = 0;

    spaceScore += spaceLevel * 100;

    enemySpawnRate = Math.max(40, 50 - spaceLevel * 4);
    enemyShootRate = Math.max(90, 150 - spaceLevel * 10);

    enemies = [];
    enemyBullets = [];

    gameState = STATE_SPACE_LEVEL;
}

function spawnPowerup(x, y) {
    var type = Math.floor(Math.random() * powerupTypes.length);
    var powerupType = powerupTypes[type];

    var powerup = {
        x: x,
        y: y,
        width: POWERUP_SIZE,
        height: POWERUP_SIZE,
        type: powerupType.type,
        color: powerupType.color,
        duration: powerupType.duration
    };

    powerups.push(powerup);
}

function createExplosion(x, y, size) {
    var explosion = {
        x: x,
        y: y,
        maxSize: size,
        life: 20,
        maxLife: 20
    };

    explosions.push(explosion);
}

function fireBullet() {
    if (spacePlayer.weaponLevel === 1) {
        var bullet = {
            x: spacePlayer.x,
            y: spacePlayer.y - spacePlayer.height / 2,
            width: BULLET_SIZE,
            height: BULLET_SIZE * 2,
            speed: 6,
            damage: 1,
            weaponLevel: spacePlayer.weaponLevel
        };
        bullets.push(bullet);
    } else if (spacePlayer.weaponLevel === 2) {
        for (var i = -1; i <= 1; i += 2) {
            var bullet = {
                x: spacePlayer.x + (i * 6),
                y: spacePlayer.y - spacePlayer.height / 2,
                width: BULLET_SIZE,
                height: BULLET_SIZE * 2,
                speed: 6,
                damage: 1,
                weaponLevel: spacePlayer.weaponLevel
            };
            bullets.push(bullet);
        }
    } else if (spacePlayer.weaponLevel === 3) {
        for (var i = -1; i <= 1; i++) {
            var bullet = {
                x: spacePlayer.x + (i * 7),
                y: spacePlayer.y - spacePlayer.height / 2,
                width: BULLET_SIZE,
                height: BULLET_SIZE * 2,
                speed: 6,
                damage: 1,
                weaponLevel: spacePlayer.weaponLevel
            };
            bullets.push(bullet);
        }

        var bullet1 = {
            x: spacePlayer.x - 12,
            y: spacePlayer.y - spacePlayer.height / 4,
            width: BULLET_SIZE,
            height: BULLET_SIZE * 1.5,
            speed: 5,
            damage: 1,
            weaponLevel: spacePlayer.weaponLevel
        };
        bullets.push(bullet1);

        var bullet2 = {
            x: spacePlayer.x + 12,
            y: spacePlayer.y - spacePlayer.height / 4,
            width: BULLET_SIZE,
            height: BULLET_SIZE * 1.5,
            speed: 5,
            damage: 1,
            weaponLevel: spacePlayer.weaponLevel
        };
        bullets.push(bullet2);
    }
}

function enemyShoot(enemy) {
    var bullet = {
        x: enemy.x,
        y: enemy.y + enemy.height / 2,
        width: BULLET_SIZE,
        height: BULLET_SIZE * 2,
        speed: 2.5,
        damage: 1
    };

    enemyBullets.push(bullet);
}

function handleSpaceMenu() {
    if (getSelPress()) {
        resetSpaceGame();
        gameState = STATE_SPACE_GAME;
    }
}

function handleSpaceGame() {
    if (isPaused) {
        if (getPrevPress()) {
            pauseMenuSelection = (pauseMenuSelection + 2) % 3;
        } else if (getNextPress()) {
            pauseMenuSelection = (pauseMenuSelection + 1) % 3;
        } else if (getSelPress()) {
            switch (pauseMenuSelection) {
                case 0:
                    isPaused = false;
                    break;
                case 1:
                    gameState = STATE_MAIN_MENU;
                    break;
                case 2:
                    exitConfirm = true;
                    confirmSelection = 0;
                    break;
            }
        }
        return;
    }

    if (getPrevPress()) {
        isPaused = true;
        pauseMenuSelection = 0;
        return;
    }

    if (getPrevPress()) {
        spacePlayer.x -= spacePlayer.speed;
    }
    if (getNextPress()) {
        spacePlayer.x += spacePlayer.speed;
    }

    if (spacePlayer.x < spacePlayer.width / 2) {
        spacePlayer.x = spacePlayer.width / 2;
    }
    if (spacePlayer.x > WIDTH - spacePlayer.width / 2) {
        spacePlayer.x = WIDTH - spacePlayer.width / 2;
    }
    if (getSelPress()) {
        if (frameCounter - lastFireTime >= fireRate) {
            fireBullet();
            lastFireTime = frameCounter;
        }
    }
}

function handleSpaceOver() {
    if (getSelPress()) {
        gameState = STATE_MAIN_MENU;
    }
}

function handleSpaceLevel() {
    if (getSelPress()) {
        gameState = STATE_SPACE_GAME;
    }
}

var BIRD_WIDTH = 16;
var BIRD_HEIGHT = 12;
var PIPE_WIDTH = 30;
var PIPE_GAP = 60;
var PIPE_SPEED = 1.5;
var GRAVITY = 0.18;
var FLAP_POWER = 3.2;
var GROUND_HEIGHT = 15;

var bird = {
    x: 60,
    y: HEIGHT / 2,
    width: BIRD_WIDTH,
    height: BIRD_HEIGHT,
    velocity: 0,
    rotation: 0
};

var pipes = [];
var flappyScore = 0;
var flappyHighScore = 0;
var pipeSpawnTimer = 0;
var isFlapping = false;
var groundOffset = 0;
var clouds = [];
var lastPipePassed = -1;
var gameStarted = false;

function resetFlappyGame() {
    bird.y = HEIGHT / 2;
    bird.velocity = 0;
    bird.rotation = 0;

    pipes = [];
    flappyScore = 0;
    pipeSpawnTimer = 0;
    lastPipePassed = -1;
    gameStarted = false;

    createClouds();
    spawnPipe();

    isPaused = false;
    pauseMenuSelection = 0;
}

function createClouds() {
    clouds = [];
    for (var i = 0; i < 3; i++) {
        clouds.push({
            x: Math.random() * WIDTH,
            y: Math.random() * 40 + 10,
            width: Math.random() * 40 + 20,
            height: Math.random() * 10 + 8,
            speed: Math.random() * 0.3 + 0.2
        });
    }
}

function spawnPipe() {
    var gapY = Math.random() * (HEIGHT - PIPE_GAP - GROUND_HEIGHT - 40) + 20;

    pipes.push({
        x: WIDTH,
        y: gapY,
        width: PIPE_WIDTH,
        height: PIPE_GAP,
        passed: false
    });
}

function drawFlappyMenu() {
    fillScreen(LIGHTBLUE);

    setTextSize(2);
    setTextColor(YELLOW);
    drawString("FLAPPY", 80, 30);
    drawString("BIRD", 95, 55);

    drawBird(100, 90, 0);

    setTextSize(1);
    setTextColor(GREEN);
    drawString("M5: FLAP", 90, 115);
    setTextColor(WHITE);
    drawString("<- or ->: PAUSE", 70, 130);
}

function drawFlappyGame() {
    fillScreen(LIGHTBLUE);

    drawClouds();
    drawPipes();
    drawGround();

    var rotation = bird.velocity * 1.5;
    if (rotation > 25) rotation = 25;
    if (rotation < -25) rotation = -25;

    drawBird(bird.x, bird.y, rotation);

    drawFlappyHUD();

    if (!gameStarted) {
        setTextSize(1);
        setTextColor(WHITE);
        drawString("PRESS M5 TO START", 65, 60);
    }

    if (isPaused) {
        drawFlappyPause();
    }
}

function drawFlappyOver() {
    fillScreen(LIGHTBLUE);

    drawClouds();
    drawPipes();
    drawGround();
    drawBird(bird.x, bird.y, 90);

    setTextSize(2);
    setTextColor(RED);
    drawString("GAME OVER", 65, 40);

    setTextSize(1);
    setTextColor(WHITE);
    drawString("SCORE: " + flappyScore, 90, 65);

    if (flappyScore > flappyHighScore) {
        setTextColor(YELLOW);
        drawString("NEW HIGH SCORE!", 65, 80);
    }

    setTextColor(GREEN);
    drawString("M5: BACK TO MENU", 65, 95);
}

function drawBird(x, y, rotation) {
    var bodyColor = YELLOW;
    var wingColor = WHITE;
    var beakColor = ORANGE;
    var eyeColor = WHITE;

    drawFillRect(x - BIRD_WIDTH / 2, y - BIRD_HEIGHT / 2, BIRD_WIDTH, BIRD_HEIGHT, bodyColor);

    if (isFlapping && frameCounter % 10 < 5) {
        drawFillRect(x - BIRD_WIDTH / 2 - 4, y - 2, 5, 6, wingColor);
    } else {
        drawFillRect(x - BIRD_WIDTH / 2 - 2, y, 4, 4, wingColor);
    }

    drawFillRect(x + BIRD_WIDTH / 4, y - BIRD_HEIGHT / 2 - 2, 4, 3, beakColor);

    drawFillRect(x + BIRD_WIDTH / 4, y - BIRD_HEIGHT / 4, 3, 3, eyeColor);
    drawFillRect(x + BIRD_WIDTH / 4 + 1, y - BIRD_HEIGHT / 4 + 1, 1, 1, BLACK);
}

function drawPipes() {
    for (var i = 0; i < pipes.length; i++) {
        var pipe = pipes[i];

        var pipeColor = GREEN;
        var pipeCapColor = LIGHTGREEN;

        drawFillRect(pipe.x, 0, pipe.width, pipe.y, pipeColor);
        drawFillRect(pipe.x - 2, pipe.y - 6, pipe.width + 4, 6, pipeCapColor);

        drawFillRect(pipe.x, pipe.y + pipe.height, pipe.width, HEIGHT - (pipe.y + pipe.height) - GROUND_HEIGHT, pipeColor);
        drawFillRect(pipe.x - 2, pipe.y + pipe.height, pipe.width + 4, 6, pipeCapColor);
    }
}

function drawGround() {
    var groundColor = BROWN;
    var grassColor = GREEN;

    drawFillRect(0, HEIGHT - GROUND_HEIGHT, WIDTH, GROUND_HEIGHT, groundColor);
    drawFillRect(0, HEIGHT - GROUND_HEIGHT, WIDTH, 3, grassColor);

    for (var i = 0; i < WIDTH; i += 20) {
        var offset = (i + groundOffset) % 20;
        drawFillRect(i - offset, HEIGHT - GROUND_HEIGHT + 5, 8, 2, DARKRED);
    }
}

function drawClouds() {
    for (var i = 0; i < clouds.length; i++) {
        var cloud = clouds[i];
        drawFillRect(cloud.x, cloud.y, cloud.width, cloud.height, WHITE);
    }
}

function drawFlappyHUD() {
    setTextSize(2);
    setTextColor(WHITE);
    drawString("" + flappyScore, WIDTH / 2 - 5, 30);
}

function drawFlappyPause() {
    setTextSize(2);
    setTextColor(WHITE);
    drawString("PAUSED", 80, 40);

    setTextSize(1);

    var options = ["CONTINUE", "MAIN MENU", "EXIT"];

    for (var i = 0; i < options.length; i++) {
        if (i === pauseMenuSelection) {
            setTextColor(YELLOW);
            drawFillRect(70, 60 + i * 15, 100, 12, BLUE);
        } else {
            setTextColor(WHITE);
        }
        drawString(options[i], 85, 65 + i * 15);
    }

    setTextColor(WHITE);
    drawString("<- or ->: SELECT", 10, 120);
    drawString("M5: CONFIRM", 150, 120);
}

function updateFlappyGame() {
    if (isPaused || !gameStarted) return;

    frameCounter++;

    groundOffset = (groundOffset + 1) % 20;

    bird.velocity += GRAVITY;
    bird.y += bird.velocity;

    if (bird.y < 0) {
        bird.y = 0;
        bird.velocity = 0;
    }

    if (bird.y > HEIGHT - GROUND_HEIGHT - BIRD_HEIGHT / 2) {
        bird.y = HEIGHT - GROUND_HEIGHT - BIRD_HEIGHT / 2;
        flappyGameOver();
        return;
    }

    pipeSpawnTimer++;
    if (pipeSpawnTimer >= 100) {
        spawnPipe();
        pipeSpawnTimer = 0;
    }

    for (var i = 0; i < clouds.length; i++) {
        clouds[i].x -= clouds[i].speed;
        if (clouds[i].x + clouds[i].width < 0) {
            clouds[i].x = WIDTH;
            clouds[i].y = Math.random() * 40 + 10;
            clouds[i].width = Math.random() * 40 + 20;
            clouds[i].height = Math.random() * 10 + 8;
        }
    }

    for (var i = 0; i < pipes.length; i++) {
        pipes[i].x -= PIPE_SPEED;

        if (pipes[i].x + pipes[i].width < 0) {
            pipes.splice(i, 1);
            i--;
            continue;
        }

        if (!pipes[i].passed && pipes[i].x + pipes[i].width < bird.x - BIRD_WIDTH / 2) {
            pipes[i].passed = true;
            flappyScore++;
            lastPipePassed = i;
        }

        if (checkCollision(
            bird.x - BIRD_WIDTH / 2, bird.y - BIRD_HEIGHT / 2, BIRD_WIDTH, BIRD_HEIGHT,
            pipes[i].x, 0, pipes[i].width, pipes[i].y
        ) || checkCollision(
            bird.x - BIRD_WIDTH / 2, bird.y - BIRD_HEIGHT / 2, BIRD_WIDTH, BIRD_HEIGHT,
            pipes[i].x, pipes[i].y + pipes[i].height,
            pipes[i].width, HEIGHT - (pipes[i].y + pipes[i].height) - GROUND_HEIGHT
        )) {
            flappyGameOver();
            return;
        }
    }
}

function flappyGameOver() {
    gameState = STATE_FLAPPY_OVER;

    if (flappyScore > flappyHighScore) {
        flappyHighScore = flappyScore;
    }
}

function flap() {
    bird.velocity = -FLAP_POWER;
    isFlapping = true;
}

function handleFlappyMenu() {
    if (getSelPress()) {
        resetFlappyGame();
        gameState = STATE_FLAPPY_GAME;
    }
}

function handleFlappyGame() {
    if (isPaused) {
        if (getPrevPress()) {
            pauseMenuSelection = (pauseMenuSelection + 2) % 3;
        } else if (getNextPress()) {
            pauseMenuSelection = (pauseMenuSelection + 1) % 3;
        } else if (getSelPress()) {
            switch (pauseMenuSelection) {
                case 0:
                    isPaused = false;
                    break;
                case 1:
                    gameState = STATE_MAIN_MENU;
                    break;
                case 2:
                    exitConfirm = true;
                    confirmSelection = 0;
                    break;
            }
        }
        return;
    }

    if (getPrevPress() || getNextPress()) {
        isPaused = true;
        pauseMenuSelection = 0;
        return;
    }

    if (getSelPress()) {
        if (!gameStarted) {
            gameStarted = true;
        }
        flap();
        isFlapping = true;
    } else {
        isFlapping = false;
    }
}

function handleFlappyOver() {
    if (getSelPress()) {
        gameState = STATE_MAIN_MENU;
    }
}

var REEL_COUNT = 3;
var REEL_HEIGHT = 55;
var SYMBOL_SIZE = 40;
var SPIN_SPEED = 30;
var SPIN_DURATION = 120;

var symbolGraphics = [
    { name: "CHERRY", color: RED },
    { name: "LEMON", color: YELLOW },
    { name: "BELL", color: GOLD },
    { name: "DIAMOND", color: CYAN },
    { name: "SEVEN", color: MAGENTA }
];

var reels = [];
var reelPositions = [];
var reelTargets = [];
var reelSpeed = [];
var spinTimer = 0;
var isSpinning = false;
var winAmount = 0;
var showWin = false;
var slotPaused = false;
var spinDelay = [0, 15, 30];

function resetSlotGame() {
    reels = [];
    reelPositions = [];
    reelTargets = [];
    reelSpeed = [];

    for (var i = 0; i < REEL_COUNT; i++) {
        var reel = [];
        for (var j = 0; j < 20; j++) {
            reel.push(Math.floor(Math.random() * symbolGraphics.length));
        }
        reels.push(reel);
        reelPositions.push(0);
        reelTargets.push(0);
        reelSpeed.push(0);
    }

    spinTimer = 0;
    isSpinning = false;
    winAmount = 0;
    showWin = false;
    isPaused = false;
    slotPaused = false;
    pauseMenuSelection = 0;
}

function drawSlotMenu() {
    fillScreen(DARKBLUE);

    setTextSize(3);
    setTextColor(GOLD);
    drawString("SLOT", 85, 25);
    drawString("MACHINE", 65, 50);

    setTextSize(1);
    setTextColor(WHITE);
    drawString("M5: SPIN", 95, 85);
    drawString("<- & ->: PAUSE", 75, 100);

    drawSymbols(70, 120, 0.6);

    setTextColor(GREEN);
    drawString("M5: START GAME", 75, 130);
}

function drawSlotGame() {
    fillScreen(DARKBLUE);

    drawSlotMachine();
    drawSlotHUD();

    if (showWin && winAmount > 0) {
        drawWinMessage();
    }

    if (slotPaused) {
        drawSlotPause();
    }
}

function drawSlotWin() {
    fillScreen(DARKBLUE);

    setTextSize(3);
    setTextColor(GOLD);
    drawString("JACKPOT!", 60, 30);

    setTextSize(2);
    setTextColor(GREEN);
    drawString("YOU WIN", 80, 65);

    setTextSize(1);
    setTextColor(WHITE);
    drawString("M5: CONTINUE", 80, 120);
}

function drawSlotMachine() {
    drawFillRect(20, 20, WIDTH - 40, HEIGHT - 70, BLACK);
    drawRect(19, 19, WIDTH - 38, HEIGHT - 68, GOLD);
    drawRect(18, 18, WIDTH - 36, HEIGHT - 66, GOLD);

    for (var i = 0; i < REEL_COUNT; i++) {
        drawFillRect(40 + i * 55, 30, 45, REEL_HEIGHT, DARKGRAY);
        drawRect(40 + i * 55, 30, 45, REEL_HEIGHT, WHITE);

        var reelPos = Math.floor(reelPositions[i]);
        var pos = reelPos % reels[i].length;
        var symbolIndex = reels[i][pos];

        drawSymbol(62 + i * 55, 30 + REEL_HEIGHT / 2, symbolIndex, 1.0);
    }

    drawRect(38, 30 + REEL_HEIGHT / 2 - 17, 163, 35, RED);
}

function drawSymbols(x, y, scale) {
    for (var i = 0; i < symbolGraphics.length; i++) {
        drawSymbol(x + i * 20, y, i, scale);
    }
}

function drawSymbol(x, y, symbolIndex, scale) {
    var size = SYMBOL_SIZE * scale;
    var symbol = symbolGraphics[symbolIndex];

    switch (symbolIndex) {
        case 0:
            drawFillRect(x - 7 * scale, y - 6 * scale, 4 * scale, 8 * scale, GREEN);
            drawFillRect(x + 4 * scale, y - 6 * scale, 4 * scale, 8 * scale, GREEN);
            drawFillRect(x - 10 * scale, y + 2 * scale, 10 * scale, 10 * scale, symbol.color);
            drawFillRect(x + 2 * scale, y + 2 * scale, 10 * scale, 10 * scale, symbol.color);
            break;

        case 1:
            drawFillRect(x - 8 * scale, y - 6 * scale, 16 * scale, 14 * scale, symbol.color);
            drawFillRect(x - 10 * scale, y, 2 * scale, 2 * scale, GREEN);
            drawFillRect(x - 9 * scale, y - 8 * scale, 3 * scale, 3 * scale, GREEN);
            break;

        case 2:
            drawFillRect(x - 8 * scale, y - 10 * scale, 16 * scale, 4 * scale, symbol.color);
            drawFillRect(x - 10 * scale, y - 6 * scale, 20 * scale, 12 * scale, symbol.color);
            drawFillRect(x - 3 * scale, y + 6 * scale, 6 * scale, 4 * scale, symbol.color);
            drawFillRect(x - 1 * scale, y + 10 * scale, 2 * scale, 2 * scale, DARKGRAY);
            break;

        case 3:
            for (var i = 0; i < 5; i++) {
                var width = (4 - Math.abs(i - 2)) * 5 * scale;
                var height = 3 * scale;
                var xOffset = -width / 2;
                var yOffset = (i - 2) * 4 * scale;
                drawFillRect(x + xOffset, y + yOffset, width, height, symbol.color);
            }
            break;

        case 4:
            drawFillRect(x - 8 * scale, y - 10 * scale, 16 * scale, 4 * scale, symbol.color);
            drawFillRect(x + 4 * scale, y - 6 * scale, 4 * scale, 16 * scale, symbol.color);
            drawFillRect(x, y - 2 * scale, 4 * scale, 4 * scale, symbol.color);
            drawFillRect(x - 4 * scale, y + 2 * scale, 4 * scale, 4 * scale, symbol.color);
            break;
    }
}

function drawSlotHUD() {
    setTextSize(1);
    setTextColor(WHITE);
    drawString("SLOT MACHINE", 80, 100);

    if (winAmount > 0) {
        setTextColor(GREEN);
        drawString("WIN!", 100, 115);
    }

    setTextColor(WHITE);
    drawString("M5: SPIN", 170, 100);
    drawString("PREV: PAUSE", 150, 115);
}

function drawWinMessage() {
    if (frameCounter % 20 < 10) {
        setTextSize(2);
        setTextColor(GOLD);
        drawString("YOU WIN!", 80, 15);
    }
}

function drawSlotPause() {
    setTextSize(2);
    setTextColor(WHITE);
    drawString("PAUSED", 80, 40);

    setTextSize(1);

    var options = ["CONTINUE", "MAIN MENU", "EXIT"];

    for (var i = 0; i < options.length; i++) {
        if (i === pauseMenuSelection) {
            setTextColor(YELLOW);
            drawFillRect(70, 60 + i * 15, 100, 12, BLUE);
        } else {
            setTextColor(WHITE);
        }
        drawString(options[i], 85, 65 + i * 15);
    }

    setTextColor(WHITE);
    drawString("<- or ->: SELECT", 10, 120);
    drawString("M5: CONFIRM", 150, 120);
}

function updateSlotGame() {
    if (slotPaused) return;

    frameCounter++;

    if (isSpinning) {
        for (var i = 0; i < REEL_COUNT; i++) {
            if (spinTimer > spinDelay[i]) {
                if (reelSpeed[i] < SPIN_SPEED) {
                    reelSpeed[i] += 2;
                }
            }

            if (spinTimer > SPIN_DURATION + spinDelay[i]) {
                reelSpeed[i] = Math.max(0, reelSpeed[i] - 1);

                if (reelSpeed[i] === 0) {
                    reelPositions[i] = reelTargets[i];
                }
            }

            reelPositions[i] = (reelPositions[i] + reelSpeed[i] / 100) % reels[i].length;
        }

        spinTimer++;

        var allStopped = true;
        for (var i = 0; i < REEL_COUNT; i++) {
            if (reelSpeed[i] > 0) {
                allStopped = false;
                break;
            }
        }

        if (allStopped && spinTimer > SPIN_DURATION + spinDelay[REEL_COUNT - 1] + 20) {
            isSpinning = false;
            checkWin();
        }
    }
}

function spinReels() {
    if (isSpinning) return;

    isSpinning = true;
    spinTimer = 0;
    showWin = false;
    winAmount = 0;

    for (var i = 0; i < REEL_COUNT; i++) {
        reelTargets[i] = Math.floor(Math.random() * reels[i].length);
        reelSpeed[i] = 0;
    }
}

function checkWin() {
    var symbolsShowing = [];
    for (var i = 0; i < REEL_COUNT; i++) {
        var reelPos = Math.floor(reelPositions[i]);
        symbolsShowing.push(reels[i][reelPos % reels[i].length]);
    }

    var middleRow = true;
    var firstSymbol = symbolsShowing[0];

    for (var i = 1; i < REEL_COUNT; i++) {
        if (symbolsShowing[i] !== firstSymbol) {
            middleRow = false;
            break;
        }
    }

    if (middleRow) {
        var multiplier = 0;
        switch (firstSymbol) {
            case 0: multiplier = 2; break;
            case 1: multiplier = 3; break;
            case 2: multiplier = 5; break;
            case 3: multiplier = 10; break;
            case 4: multiplier = 20; break;
        }

        winAmount = 10 * multiplier;
        showWin = true;

        if (multiplier >= 10) {
            gameState = STATE_SLOT_WIN;
        }
    }
}

function handleSlotMenu() {
    if (getSelPress()) {
        resetSlotGame();
        gameState = STATE_SLOT_GAME;
    }
}

function handleSlotGame() {
    if (slotPaused) {
        if (getPrevPress()) {
            pauseMenuSelection = (pauseMenuSelection + 2) % 3;
        } else if (getNextPress()) {
            pauseMenuSelection = (pauseMenuSelection + 1) % 3;
        } else if (getSelPress()) {
            switch (pauseMenuSelection) {
                case 0:
                    slotPaused = false;
                    break;
                case 1:
                    gameState = STATE_MAIN_MENU;
                    break;
                case 2:
                    exitConfirm = true;
                    confirmSelection = 0;
                    break;
            }
        }
        return;
    }

    if (getPrevPress()) {
        slotPaused = true;
        pauseMenuSelection = 0;
        return;
    }

    if (!isSpinning && getSelPress()) {
        spinReels();
    }
}

function handleSlotWin() {
    if (getSelPress()) {
        gameState = STATE_SLOT_GAME;
    }
}

var blackjackGame = {
    gameState: 0,
    playerMoney: 1000,
    currentBet: 0,
    deck: [],
    playerHand: [],
    dealerHand: [],
    playerBust: false,
    dealerBust: false,
    playerBlackjack: false,
    screenWidth: WIDTH,
    screenHeight: HEIGHT,
};

var BET_OPTIONS = [10, 25, 50, 100];
var selectedBetIndex = 0;
var lastBet = 10;
var bjMessage = "";
var messageTimer = 0;
var SUITS = ['H', 'D', 'S', 'C'];
var VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
var bjMenuIndex = 0;

var BJ_MENU = 0;
var BJ_SELECT_BET = 1;
var BJ_PLAYING = 2;
var BJ_GAME_OVER = 3;

function setupBlackjack() {
    blackjackGame.gameState = BJ_MENU;
    blackjackGame.playerMoney = 1000;
    blackjackGame.currentBet = 0;
    blackjackGame.deck = [];
    blackjackGame.playerHand = [];
    blackjackGame.dealerHand = [];
    blackjackGame.playerBust = false;
    blackjackGame.dealerBust = false;
    blackjackGame.playerBlackjack = false;

    createBlackjackDeck();
    bjMenuIndex = 0;
}

function showBlackjackMessage(msg) {
    bjMessage = msg;
    messageTimer = Date.now() + 2000;
}

function updateBlackjackMessage() {
    if (bjMessage !== "" && Date.now() > messageTimer) {
        bjMessage = "";
    }
}

function createBlackjackDeck() {
    blackjackGame.deck = [];
    for (var i = 0; i < SUITS.length; i++) {
        for (var j = 0; j < VALUES.length; j++) {
            blackjackGame.deck.push({ suit: SUITS[i], value: VALUES[j] });
        }
    }
    shuffleBlackjackDeck();
}

function shuffleBlackjackDeck() {
    for (var i = blackjackGame.deck.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = blackjackGame.deck[i];
        blackjackGame.deck[i] = blackjackGame.deck[j];
        blackjackGame.deck[j] = temp;
    }
}

function drawBlackjackCard() {
    if (blackjackGame.deck.length < 10) {
        createBlackjackDeck();
    }
    return blackjackGame.deck.pop();
}

function calculateHandValue(hand) {
    var value = 0;
    var aces = 0;
    for (var i = 0; i < hand.length; i++) {
        var card = hand[i];
        if (card.value === 'A') {
            aces++;
            value += 11;
        } else if (card.value === 'J' || card.value === 'Q' || card.value === 'K') {
            value += 10;
        } else {
            value += parseInt(card.value);
        }
    }
    while (value > 21 && aces > 0) {
        value -= 10;
        aces--;
    }
    return value;
}

function startBlackjackGame(betAmount) {
    if (blackjackGame.playerMoney < betAmount) {
        showBlackjackMessage("Not enough money!");
        return false;
    }

    blackjackGame.currentBet = betAmount;
    blackjackGame.playerMoney -= betAmount;
    lastBet = betAmount;
    blackjackGame.gameState = BJ_PLAYING;
    blackjackGame.playerHand = [];
    blackjackGame.dealerHand = [];
    blackjackGame.playerBust = false;
    blackjackGame.dealerBust = false;
    blackjackGame.playerBlackjack = false;

    blackjackGame.playerHand.push(drawBlackjackCard());
    blackjackGame.dealerHand.push(drawBlackjackCard());
    blackjackGame.playerHand.push(drawBlackjackCard());
    blackjackGame.dealerHand.push(drawBlackjackCard());

    if (calculateHandValue(blackjackGame.playerHand) === 21) {
        blackjackGame.playerBlackjack = true;
        dealerTurn();
    }

    return true;
}

function hit() {
    if (blackjackGame.gameState !== BJ_PLAYING) return;

    blackjackGame.playerHand.push(drawBlackjackCard());
    var handValue = calculateHandValue(blackjackGame.playerHand);

    if (handValue > 21) {
        blackjackGame.playerBust = true;
        dealerTurn();
    } else if (handValue === 21) {
        dealerTurn();
    }
}

function stand() {
    if (blackjackGame.gameState !== BJ_PLAYING) return;
    dealerTurn();
}

function dealerTurn() {
    if (!blackjackGame.playerBust && !blackjackGame.playerBlackjack) {
        var dealerValue = calculateHandValue(blackjackGame.dealerHand);
        while (dealerValue < 17) {
            blackjackGame.dealerHand.push(drawBlackjackCard());
            dealerValue = calculateHandValue(blackjackGame.dealerHand);
        }
        if (dealerValue > 21) {
            blackjackGame.dealerBust = true;
        }
    }
    determineWinner();
}

function determineWinner() {
    blackjackGame.gameState = BJ_GAME_OVER;
    var playerValue = calculateHandValue(blackjackGame.playerHand);
    var dealerValue = calculateHandValue(blackjackGame.dealerHand);

    if (blackjackGame.playerBlackjack) {
        if (calculateHandValue(blackjackGame.dealerHand) === 21 && blackjackGame.dealerHand.length === 2) {
            blackjackGame.playerMoney += blackjackGame.currentBet;
            showBlackjackMessage("Both have blackjack! Push!");
        } else {
            var winnings = Math.floor(blackjackGame.currentBet * 2.5);
            blackjackGame.playerMoney += winnings;
            showBlackjackMessage("BLACKJACK! You won " + winnings + "!");
        }
    }
    else if (blackjackGame.playerBust) {
        showBlackjackMessage("You bust! Lost " + blackjackGame.currentBet + "!");
    }
    else if (blackjackGame.dealerBust) {
        blackjackGame.playerMoney += blackjackGame.currentBet * 2;
        showBlackjackMessage("Dealer busts! You won " + (blackjackGame.currentBet * 2) + "!");
    }
    else if (playerValue > dealerValue) {
        blackjackGame.playerMoney += blackjackGame.currentBet * 2;
        showBlackjackMessage("You win! You won " + (blackjackGame.currentBet * 2) + "!");
    }
    else if (playerValue === dealerValue) {
        blackjackGame.playerMoney += blackjackGame.currentBet;
        showBlackjackMessage("Push! Bet returned!");
    }
    else {
        showBlackjackMessage("You lose! Lost " + blackjackGame.currentBet + "!");
    }
}

function drawBlackjackCardGraphic(x, y, card) {
    var cardWidth = 25;
    var cardHeight = 35;

    if (card) {
        drawFillRect(x, y, cardWidth, cardHeight, WHITE);
        drawRect(x, y, cardWidth, cardHeight, BLACK);

        var suitSymbol = "";
        var cardColor = BLACK;

        if (card.suit === 'H') {
            suitSymbol = "v";
            cardColor = RED;
        } else if (card.suit === 'D') {
            suitSymbol = "o";
            cardColor = RED;
        } else if (card.suit === 'S') {
            suitSymbol = "^";
            cardColor = BLACK;
        } else if (card.suit === 'C') {
            suitSymbol = "#";
            cardColor = BLACK;
        }

        setTextSize(1);
        setTextColor(cardColor);
        drawString(card.value, x + 3, y + 3);
        drawString(suitSymbol, x + cardWidth / 2 - 3, y + cardHeight / 2 - 3);
        drawString(card.value, x + cardWidth - 8, y + cardHeight - 10);
    } else {
        drawFillRect(x, y, cardWidth, cardHeight, BLUE);
        drawRect(x, y, cardWidth, cardHeight, WHITE);
        drawFillRect(x + 3, y + 8, cardWidth - 6, cardHeight - 16, RED);
        setTextSize(1);
        setTextColor(WHITE);
        drawString("BJ", x + 7, y + 16);
    }
}

function drawBlackjackMenu() {
    fillScreen(BLACK);

    setTextSize(3);
    setTextColor(RED);
    drawString("BLACK", 20, 10);
    setTextColor(GOLD);
    drawString("JACK", 120, 10);

    drawFillRect(0, 40, WIDTH, HEIGHT - 40, DARKGRAY);
    drawRect(0, 40, WIDTH, HEIGHT - 40, GOLD);

    var menuOptions = ["PLAY", "MONEY: " + blackjackGame.playerMoney, "RESET", "EXIT"];

    for (var i = 0; i < menuOptions.length; i++) {
        if (i === bjMenuIndex) {
            setTextColor(YELLOW);
            drawFillRect(70, 50 + i * 22, 100, 20, BLACK);
            drawRect(70, 50 + i * 22, 100, 20, YELLOW);
        } else {
            setTextColor(WHITE);
        }

        setTextSize(2);
        var textX = 120 - (menuOptions[i].length * 5);
        drawString(menuOptions[i], textX, 55 + i * 22);
    }

    if (bjMessage !== "") {
        setTextColor(YELLOW);
        drawFillRect(20, HEIGHT - 20, WIDTH - 40, 12, BLACK);
        drawString(bjMessage, 25, HEIGHT - 18);
    }

    setTextSize(1);
    setTextColor(GOLD);
    drawString("Made by MSI Development", 55, 35);
}

function drawBlackjackSelectBet() {
    fillScreen(BLACK);

    setTextSize(2);
    setTextColor(GOLD);
    drawString("SELECT BET", 70, 10);

    drawFillRect(0, 30, WIDTH, HEIGHT - 30, DARKGRAY);
    drawRect(0, 30, WIDTH, HEIGHT - 30, GOLD);

    setTextSize(2);
    setTextColor(WHITE);
    drawString("MONEY: " + blackjackGame.playerMoney, 60, 40);

    for (var i = 0; i < BET_OPTIONS.length; i++) {
        if (i === selectedBetIndex) {
            setTextColor(YELLOW);
            drawRect(40 + i * 45, 60, 40, 30, YELLOW);
        } else {
            setTextColor(WHITE);
        }

        drawString(BET_OPTIONS[i].toString(), 45 + i * 45, 70);
    }

    setTextSize(2);
    setTextColor(WHITE);
    drawString("LAST BET: " + lastBet, 60, 110);
}

function drawBlackjackGame() {
    fillScreen(BLACK);

    drawFillRect(0, 0, WIDTH, HEIGHT, DARKGRAY);
    drawRect(0, 0, WIDTH, HEIGHT, GOLD);

    setTextSize(1);
    setTextColor(WHITE);
    drawString("DEALER: ", 10, 5);

    if (blackjackGame.gameState === BJ_GAME_OVER) {
        drawString(calculateHandValue(blackjackGame.dealerHand).toString(), 70, 5);
    } else {
        drawString("?", 70, 5);
    }

    drawString("BET: " + blackjackGame.currentBet, 130, 5);
    drawString("MONEY: " + blackjackGame.playerMoney, 130, 20);

    var dealerStartX = 10;
    var dealerY = 20;

    for (var i = 0; i < blackjackGame.dealerHand.length; i++) {
        if (i === 0 && blackjackGame.gameState === BJ_PLAYING) {
            drawBlackjackCardGraphic(dealerStartX + i * 28, dealerY, null);
        } else {
            drawBlackjackCardGraphic(dealerStartX + i * 28, dealerY, blackjackGame.dealerHand[i]);
        }
    }

    drawLine(0, 65, WIDTH, 65, YELLOW);

    setTextColor(WHITE);
    drawString("PLAYER: " + calculateHandValue(blackjackGame.playerHand), 10, 70);

    var playerStartX = 10;
    var playerY = 85;

    for (var i = 0; i < blackjackGame.playerHand.length; i++) {
        drawBlackjackCardGraphic(playerStartX + i * 28, playerY, blackjackGame.playerHand[i]);
    }

    if (blackjackGame.gameState === BJ_PLAYING && !blackjackGame.playerBlackjack) {
        setTextColor(YELLOW);
        drawString("NEXT: STAND", 10, HEIGHT - 10);
        drawString("M5: HIT", 150, HEIGHT - 10);
    }

    if (blackjackGame.gameState === BJ_GAME_OVER) {
        setTextColor(YELLOW);
        drawString("NEXT: MENU", 10, HEIGHT - 10);
        drawString("M5: PLAY AGAIN", 120, HEIGHT - 10);
    }

    if (bjMessage !== "") {
        setTextColor(YELLOW);
        drawFillRect(20, 50, WIDTH - 40, 12, BLACK);
        drawString(bjMessage, 25, 52);
    }
}

function handleBlackjackMenu() {
    if (getNextPress()) {
        bjMenuIndex = (bjMenuIndex + 1) % 4;
        delay(200);
        return;
    }

    if (getSelPress()) {
        if (bjMenuIndex === 0) {
            blackjackGame.gameState = BJ_SELECT_BET;
        } else if (bjMenuIndex === 1) {
            blackjackGame.gameState = BJ_MENU;
        } else if (bjMenuIndex === 2) {
            blackjackGame.playerMoney = 1000;
            showBlackjackMessage("Money reset to 1000");
        } else if (bjMenuIndex === 3) {
            gameState = STATE_MAIN_MENU;
        }
        delay(200);
    }
}

function handleBlackjackSelectBet() {
    if (getNextPress()) {
        selectedBetIndex = (selectedBetIndex + 1) % BET_OPTIONS.length;
        delay(200);
        return;
    }

    if (getSelPress()) {
        if (startBlackjackGame(BET_OPTIONS[selectedBetIndex])) {
            blackjackGame.gameState = BJ_PLAYING;
        }
        delay(200);
    }
}

function handleBlackjackGame() {
    if (blackjackGame.gameState === BJ_PLAYING && !blackjackGame.playerBlackjack) {
        if (getNextPress()) {
            stand();
            delay(200);
            return;
        }

        if (getSelPress()) {
            hit();
            delay(200);
        }
    }
    else if (blackjackGame.gameState === BJ_GAME_OVER) {
        if (getNextPress()) {
            blackjackGame.gameState = BJ_MENU;
            delay(200);
            return;
        }

        if (getSelPress()) {
            if (startBlackjackGame(lastBet)) {
                blackjackGame.gameState = BJ_PLAYING;
            } else {
                blackjackGame.gameState = BJ_MENU;
            }
            delay(200);
        }
    }
}

function drawBlackjack() {
    switch (blackjackGame.gameState) {
        case BJ_MENU:
            drawBlackjackMenu();
            break;
        case BJ_SELECT_BET:
            drawBlackjackSelectBet();
            break;
        case BJ_PLAYING:
        case BJ_GAME_OVER:
            drawBlackjackGame();
            break;
    }
}

function handleBlackjack() {
    updateBlackjackMessage();

    switch (blackjackGame.gameState) {
        case BJ_MENU:
            handleBlackjackMenu();
            break;
        case BJ_SELECT_BET:
            handleBlackjackSelectBet();
            break;
        case BJ_PLAYING:
        case BJ_GAME_OVER:
            handleBlackjackGame();
            break;
    }
}

function checkRectCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}

function checkCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}

function drawGame() {
    if (exitConfirm) {
        drawExitConfirm();
        return;
    }

    switch (gameState) {
        case STATE_MAIN_MENU:
            drawMainMenu();
            break;
        case STATE_SNAKE_GAME:
            drawSnakeGame();
            break;
        case STATE_SNAKE_OVER:
            drawSnakeOver();
            break;
        case STATE_BREAKOUT_MENU:
            drawBreakoutMenu();
            break;
        case STATE_BREAKOUT_GAME:
            drawBreakoutGame();
            break;
        case STATE_BREAKOUT_OVER:
            drawBreakoutOver();
            break;
        case STATE_BREAKOUT_WIN:
            drawBreakoutWin();
            break;
        case STATE_BREAKOUT_NEXT:
            drawBreakoutNext();
            break;
        case STATE_SPACE_MENU:
            drawSpaceMenu();
            break;
        case STATE_SPACE_GAME:
            drawSpaceGame();
            break;
        case STATE_SPACE_OVER:
            drawSpaceOver();
            break;
        case STATE_SPACE_LEVEL:
            drawSpaceLevel();
            break;
        case STATE_FLAPPY_MENU:
            drawFlappyMenu();
            break;
        case STATE_FLAPPY_GAME:
            drawFlappyGame();
            break;
        case STATE_FLAPPY_OVER:
            drawFlappyOver();
            break;
        case STATE_SLOT_MENU:
            drawSlotMenu();
            break;
        case STATE_SLOT_GAME:
            drawSlotGame();
            break;
        case STATE_SLOT_WIN:
            drawSlotWin();
            break;
        case STATE_BLACKJACK_MENU:
        case STATE_BLACKJACK_BET:
        case STATE_BLACKJACK_GAME:
        case STATE_BLACKJACK_OVER:
            drawBlackjack();
            break;
    }
}

function handleInput() {
    if (exitConfirm) {
        handleMainMenu();
        return;
    }

    switch (gameState) {
        case STATE_MAIN_MENU:
            handleMainMenu();
            break;
        case STATE_SNAKE_GAME:
            handleSnakeGame();
            break;
        case STATE_SNAKE_OVER:
            handleSnakeOver();
            break;
        case STATE_BREAKOUT_MENU:
            handleBreakoutMenu();
            break;
        case STATE_BREAKOUT_GAME:
            handleBreakoutGame();
            break;
        case STATE_BREAKOUT_OVER:
            handleBreakoutOver();
            break;
        case STATE_BREAKOUT_WIN:
            handleBreakoutWin();
            break;
        case STATE_BREAKOUT_NEXT:
            handleBreakoutNext();
            break;
        case STATE_SPACE_MENU:
            handleSpaceMenu();
            break;
        case STATE_SPACE_GAME:
            handleSpaceGame();
            break;
        case STATE_SPACE_OVER:
            handleSpaceOver();
            break;
        case STATE_SPACE_LEVEL:
            handleSpaceLevel();
            break;
        case STATE_FLAPPY_MENU:
            handleFlappyMenu();
            break;
        case STATE_FLAPPY_GAME:
            handleFlappyGame();
            break;
        case STATE_FLAPPY_OVER:
            handleFlappyOver();
            break;
        case STATE_SLOT_MENU:
            handleSlotMenu();
            break;
        case STATE_SLOT_GAME:
            handleSlotGame();
            break;
        case STATE_SLOT_WIN:
            handleSlotWin();
            break;
        case STATE_BLACKJACK_MENU:
        case STATE_BLACKJACK_BET:
        case STATE_BLACKJACK_GAME:
        case STATE_BLACKJACK_OVER:
            handleBlackjack();
            break;
    }
}

function updateGame() {
    switch (gameState) {
        case STATE_SNAKE_GAME:
            updateSnakeGame();
            break;
        case STATE_BREAKOUT_GAME:
            updateBreakoutGame();
            break;
        case STATE_SPACE_GAME:
            updateSpaceGame();
            break;
        case STATE_FLAPPY_GAME:
            updateFlappyGame();
            break;
        case STATE_SLOT_GAME:
            updateSlotGame();
            break;
    }
}

function main() {
    initializeGame();

    while (true) {
        var startTime = Date.now();

        handleInput();

        if (gameState === STATE_EXIT) {
            fillScreen(BLACK);
            setTextSize(2);
            setTextColor(RED);
            drawString("EXITING...", 70, 60);
            delay(1000);
            break;
        }

        updateGame();

        drawGame();

        frameCounter++;

        var frameTime = Date.now() - startTime;
        var waitTime = Math.max(1, 33 - frameTime);
        delay(waitTime);
    }
}

main();