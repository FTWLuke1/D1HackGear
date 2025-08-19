var WIDTH = 240;
var HEIGHT = 135;
var PLAYER_SIZE = 16;
var ENEMY_SIZE = 14;
var BULLET_SIZE = 5;
var POWERUP_SIZE = 10;
var EXPLOSION_MAX_SIZE = 22;

var BLACK = 0;
var WHITE = 16777215;
var RED = 16711680;
var GREEN = 65280;
var BLUE = 255;
var YELLOW = 16776960;
var CYAN = 65535;
var MAGENTA = 16711935;
var ORANGE = 16753920;
var PURPLE = 8388736;
var DARKBLUE = 128;
var DARKRED = 8388608;
var LIGHTGREEN = 8453888;

var STATE_MENU = 0;
var STATE_GAME = 1;
var STATE_GAME_OVER = 2;
var STATE_LEVEL_UP = 3;
var gameState = STATE_MENU;

var player = {
  x: WIDTH / 2,
  y: HEIGHT - 25,
  width: PLAYER_SIZE,
  height: PLAYER_SIZE,
  speed: 7,
  lives: 3,
  weaponLevel: 1,
  weaponTime: 0,
  invincible: false,
  invincibleTime: 0,
  lastX: WIDTH / 2,
  lastY: HEIGHT - 25
};

var bullets = [];
var enemies = [];
var enemyBullets = [];
var explosions = [];
var stars = [];
var powerups = [];
var score = 0;
var highScore = 0;
var level = 1;
var frameCounter = 0;
var enemySpawnRate = 50;
var enemyShootRate = 100;
var bossActive = false;
var boss = null;
var killCount = 0;
var levelUpThreshold = 20;

var fireRate = 6;
var lastFireTime = 0;

var selPressCount = 0;
var selPressWindowStart = -1;
var selPressWindow = 40;
var selPressThreshold = 13;
var lastSelState = false;
var isPaused = false;

var enemyTypes = [
  { color: BLUE, detailColor: PURPLE, health: 1, speed: 1.2, points: 10, shootRate: 0, shape: "triangle" },
  { color: LIGHTGREEN, detailColor: DARKBLUE, health: 2, speed: 1.8, points: 20, shootRate: 100, shape: "square" },
  { color: ORANGE, detailColor: MAGENTA, health: 1, speed: 2.5, points: 15, shootRate: 0, shape: "diamond" },
  { color: BLUE, detailColor: YELLOW, health: 3, speed: 0.9, points: 30, shootRate: 70, shape: "circle" }
];

var powerupTypes = [
  { type: "health", color: WHITE },
  { type: "weapon", color: YELLOW }
];

var staticDrawn = false;
var lastStaticDrawnState = -1;
var pauseDrawn = false;

function resetGame() {
  player.x = WIDTH / 2;
  player.y = HEIGHT - 25;
  player.lastX = player.x;
  player.lastY = player.y;
  player.lives = 3;
  player.weaponLevel = 1;
  player.weaponTime = 0;
  player.invincible = false;
  player.invincibleTime = 0;
  
  bullets = [];
  enemies = [];
  enemyBullets = [];
  explosions = [];
  powerups = [];
  boss = null;
  
  score = 0;
  level = 1;
  frameCounter = 0;
  enemySpawnRate = 50;
  enemyShootRate = 100;
  bossActive = false;
  killCount = 0;
  lastFireTime = 0;
  
  selPressCount = 0;
  selPressWindowStart = -1;
  lastSelState = false;
  isPaused = false;
  
  createStars();
  
  gameState = STATE_GAME;
  staticDrawn = false;
  lastStaticDrawnState = -1;
  pauseDrawn = false;
}

function createStars() {
  stars = [];
  for (var i = 0; i < 60; i++) {
    stars.push({
      x: Math.random() * WIDTH,
      y: Math.random() * HEIGHT,
      size: Math.random() * 2.5 + 1,
      speed: Math.random() * 0.8 + 0.3,
      lastX: 0,
      lastY: 0
    });
  }
}

function updateStars() {
  for (var i = 0; i < stars.length; i++) {
    var star = stars[i];
    star.y += star.speed * 0.1;
    if (star.y > HEIGHT) star.y -= HEIGHT;
  }
}

function drawStars() {
  for (var i = 0; i < stars.length; i++) {
    var star = stars[i];
    drawFillRect(star.lastX - 1, star.lastY - 1, star.size + 2, star.size + 2, BLACK);
    var brightness = (frameCounter + i * 10) % 100;
    var color = brightness < 50 ? WHITE : CYAN;
    if (i % 7 === 0) color = YELLOW;
    if (i % 11 === 0) color = MAGENTA;
    drawFillRect(star.x, star.y, star.size, star.size, color);
    star.lastX = star.x;
    star.lastY = star.y;
  }
}

function drawGame() {
  switch (gameState) {
    case STATE_MENU:
      drawMenu();
      break;
    case STATE_GAME:
      if (!isPaused) {
        drawGameplay();
      } else {
        drawPause();
      }
      break;
    case STATE_GAME_OVER:
      drawGameOver();
      break;
    case STATE_LEVEL_UP:
      drawLevelUp();
      break;
  }
}

function drawMenu() {
  if (!staticDrawn || gameState !== lastStaticDrawnState) {
    fillScreen(BLACK);
    setTextSize(3);
    setTextColor(CYAN);
    drawString("SPACE", 75, 15);
    setTextColor(ORANGE);
    drawString("SHOOTER", 60, 40);
    
    setTextSize(1);
    setTextColor(WHITE);
    drawString("PREV: GO LEFT", 10, 100);
    drawString("M5 (PRESS): FIRE", 10, 120);
    drawString("NEXT: GO RIGHT", 140, 100);
    drawString("M5 (HOLD): PAUSE", 140, 120);
    
    if (frameCounter % 30 < 20) {
      setTextColor(WHITE);
      drawString("PRESS M5 TO START", 70, 75);
    }
    
    staticDrawn = true;
    lastStaticDrawnState = gameState;
  }
}

function drawGameplay() {
  if (!staticDrawn || gameState !== lastStaticDrawnState) {
    fillScreen(BLACK);
    staticDrawn = true;
    lastStaticDrawnState = gameState;
  }
  
  if (frameCounter % 10 === 0) {
    updateStars();
    drawStars();
  }
  
  drawEnemies();
  drawBullets();
  drawEnemyBullets();
  drawExplosions();
  drawPowerups();
  if (player.x !== player.lastX || player.y !== player.lastY) {
    drawFillRect(player.lastX - player.width/2 - 6, player.lastY - 5, player.width + 12, player.height + 15, BLACK);
    player.lastX = player.x;
    player.lastY = player.y;
  }
  drawPlayer(player.x, player.y, player.weaponLevel);
  drawHUD();
}

function drawGameOver() {
  if (!staticDrawn || gameState !== lastStaticDrawnState) {
    fillScreen(BLACK);
    drawStars();
    setTextSize(2);
    setTextColor(YELLOW);
    drawString("GAME OVER", 70, 50);
    setTextSize(1);
    setTextColor(WHITE);
    drawString("Score: " + score, 90, 80);
    drawString("Press M5 to Restart", 70, 110);
    staticDrawn = true;
    lastStaticDrawnState = gameState;
  }
}

function drawLevelUp() {
  if (!staticDrawn || gameState !== lastStaticDrawnState) {
    fillScreen(BLACK);
    drawStars();
    setTextSize(2);
    setTextColor(YELLOW);
    drawString("LEVEL UP!", 80, 50);
    setTextSize(1);
    setTextColor(WHITE);
    drawString("Press M5 to Continue", 70, 110);
    staticDrawn = true;
    lastStaticDrawnState = gameState;
  }
}

function drawPause() {
  if (!pauseDrawn) {
    fillScreen(BLACK);
    setTextSize(2);
    setTextColor(YELLOW);
    drawString("PAUSED", 90, 50);
    setTextSize(1);
    setTextColor(WHITE);
    drawString("Press NEXT to Resume", 70, 110);
    drawString("Press PREV to Exit Game", 70, 125);
    pauseDrawn = true;
  }
}

function drawPlayer(x, y, weaponLevel) {
  drawFillRect(x - player.width/2, y, player.width, player.height, BLUE);
  drawFillRect(x - player.width/2 + 3, y + 3, player.width - 6, player.height - 8, CYAN);
  drawFillRect(x - 4, y - 5, 8, 5, WHITE);
  
  if (frameCounter % 6 < 3) {
    drawFillRect(x - 6, y + player.height, 12, 4, ORANGE);
    drawFillRect(x - 4, y + player.height + 4, 8, 3, YELLOW);
  } else {
    drawFillRect(x - 5, y + player.height, 10, 5, ORANGE);
    drawFillRect(x - 3, y + player.height + 3, 6, 2, YELLOW);
  }
  
  if (weaponLevel > 1) {
    drawFillRect(x - player.width/2 - 4, y + 3, 4, 4, YELLOW);
    drawFillRect(x + player.width/2, y + 3, 4, 4, YELLOW);
    drawFillRect(x - player.width/2 - 2, y + 5, 2, 6, RED);
    drawFillRect(x + player.width/2 + 1, y + 5, 2, 6, RED);
  }
  
  if (weaponLevel > 2) {
    drawFillRect(x - player.width/2 - 4, y + 10, 4, 4, YELLOW);
    drawFillRect(x + player.width/2, y + 10, 4, 4, YELLOW);
  }
  
  if (player.invincible && frameCounter % 6 < 3) {
    drawRect(x - player.width/2 - 2, y - 2, player.width + 4, player.height + 4, WHITE);
  }
}

function drawEnemies() {
  for (var i = 0; i < enemies.length; i++) {
    var enemy = enemies[i];
    if (enemy && enemy.active) {
      drawFillRect(enemy.lastX - 5, enemy.lastY - 5, enemy.width + 10, enemy.height + 10, BLACK);
      drawFillRect(enemy.x, enemy.y, enemy.width, enemy.height, enemy.type.color);
      enemy.lastX = enemy.x;
      enemy.lastY = enemy.y;
    }
  }
  if (bossActive && boss) {
    drawFillRect(boss.lastX - 5, boss.lastY - 5, boss.width + 10, boss.height + 10, BLACK);
    drawFillRect(boss.x, boss.y, boss.width, boss.height, MAGENTA);
    boss.lastX = boss.x;
    boss.lastY = boss.y;
  }
}

function drawBullets() {
  for (var i = 0; i < bullets.length; i++) {
    var bullet = bullets[i];
    if (bullet && bullet.active) {
      if (!bullet.lastX) bullet.lastX = bullet.x;
      if (!bullet.lastY) bullet.lastY = bullet.y;
      if (bullet.x !== bullet.lastX || bullet.y !== bullet.lastY) {
        drawFillRect(bullet.lastX - bullet.width / 2, bullet.lastY, bullet.width, bullet.height + 2, BLACK);
        drawFillRect(bullet.x - bullet.width / 2, bullet.y, bullet.width, bullet.height, GREEN);
        bullet.lastX = bullet.x;
        bullet.lastY = bullet.y;
      }
    }
  }
}

function drawEnemyBullets() {
  for (var i = 0; i < enemyBullets.length; i++) {
    var bullet = enemyBullets[i];
    if (bullet && bullet.active) {
      if (!bullet.lastX) bullet.lastX = bullet.x;
      if (!bullet.lastY) bullet.lastY = bullet.y;
      if (bullet.x !== bullet.lastX || bullet.y !== bullet.lastY) {
        drawFillRect(bullet.lastX - bullet.width / 2, bullet.lastY, bullet.width, bullet.height, BLACK);
        drawFillRect(bullet.x - bullet.width / 2, bullet.y, bullet.width, bullet.height, YELLOW);
        bullet.lastX = bullet.x;
        bullet.lastY = bullet.y;
      }
    }
  }
}

function drawExplosions() {
  for (var i = 0; i < explosions.length; i++) {
    var explosion = explosions[i];
    if (explosion && explosion.active) {
      drawFillRect(explosion.x - explosion.size / 2, explosion.y - explosion.size / 2, explosion.size, explosion.size, YELLOW);
    }
  }
}

function drawPowerups() {
  for (var i = 0; i < powerups.length; i++) {
    var powerup = powerups[i];
    if (powerup && powerup.active) {
      if (!powerup.lastX) powerup.lastX = powerup.x;
      if (!powerup.lastY) powerup.lastY = powerup.y;
      if (powerup.x !== powerup.lastX || powerup.y !== powerup.lastY) {
        drawFillRect(powerup.lastX - powerup.width / 2 - 2, powerup.lastY - 2, powerup.width + 4, powerup.height + 4, BLACK);
        drawFillRect(powerup.x - powerup.width / 2, powerup.y, powerup.width, powerup.height, powerup.type.color);
        powerup.lastX = powerup.x;
        powerup.lastY = powerup.y;
      }
    }
  }
}

function drawHUD() {
  drawFillRect(0, 0, WIDTH, 10, BLACK);
  setTextSize(1);
  setTextColor(WHITE);
  drawString("SCORE: " + score, 5, 5);
  drawString("LEVEL: " + level, 100, 5);
  drawString("LIVES: " + player.lives, 180, 5);
}

function updateGame() {
  if (isPaused) {
    return;
  }
  
  frameCounter++;
  
  updateBullets();
  updateEnemies();
  updateEnemyBullets();
  updateExplosions();
  updatePowerups();
  checkCollisions();
  checkLevelProgress();
}

function updateBullets() {
  for (var i = 0; i < bullets.length; i++) {
    if (bullets[i] && bullets[i].active) {
      bullets[i].y -= bullets[i].speed;
      if (bullets[i].y + bullets[i].height < 0) {
        bullets[i].active = false;
      }
    }
  }
}

function updateEnemies() {
  if (frameCounter % enemySpawnRate === 0 && !bossActive) {
    spawnEnemy();
  }
  
  for (var i = 0; i < enemies.length; i++) {
    if (enemies[i] && enemies[i].active) {
      enemies[i].y += enemies[i].type.speed;
      if (enemies[i].y > HEIGHT) {
        drawFillRect(enemies[i].lastX - 5, enemies[i].lastY - 5, enemies[i].width + 10, enemies[i].height + 10, BLACK);
        enemies[i].active = false;
      }
      if (enemies[i].type.shootRate > 0 && frameCounter % enemies[i].type.shootRate === 0) {
        spawnEnemyBullet(enemies[i].x + enemies[i].width / 2, enemies[i].y + enemies[i].height);
      }
    }
  }
  
  if (bossActive && boss) {
    boss.y += boss.speed;
    if (boss.y + boss.height > HEIGHT) {
      boss.y = HEIGHT - boss.height;
      boss.speed = -1.5;
    } else if (boss.y < 0) {
      boss.y = 0;
      boss.speed = 1.5;
    }
    if (frameCounter % 50 === 0) {
      spawnEnemyBullet(boss.x + boss.width / 2, boss.y + boss.height);
    }
  }
}

function updateEnemyBullets() {
  for (var i = 0; i < enemyBullets.length; i++) {
    if (enemyBullets[i] && enemyBullets[i].active) {
      enemyBullets[i].y += enemyBullets[i].speed;
      if (enemyBullets[i].y > HEIGHT) {
        enemyBullets[i].active = false;
      }
    }
  }
}

function updateExplosions() {
  for (var i = 0; i < explosions.length; i++) {
    if (explosions[i] && explosions[i].active && explosions[i].life > 0) {
      explosions[i].life--;
      if (explosions[i].life <= 0) {
        explosions[i].active = false;
        drawFillRect(explosions[i].x - explosions[i].size / 2, explosions[i].y - explosions[i].size / 2, explosions[i].size, explosions[i].size, BLACK);
      }
    }
  }
}

function updatePowerups() {
  for (var i = 0; i < powerups.length; i++) {
    if (powerups[i] && powerups[i].active) {
      powerups[i].y += 1;
      if (powerups[i].y > HEIGHT) {
        powerups[i].active = false;
      }
    }
  }
}

function spawnEnemy() {
  var type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
  enemies.push({
    x: Math.random() * (WIDTH - ENEMY_SIZE),
    y: 0,
    width: ENEMY_SIZE,
    height: ENEMY_SIZE,
    type: type,
    active: true,
    lastX: 0,
    lastY: 0
  });
}

function spawnEnemyBullet(x, y) {
  enemyBullets.push({
    x: x,
    y: y,
    width: BULLET_SIZE,
    height: BULLET_SIZE,
    speed: 3,
    active: true,
    lastX: 0,
    lastY: 0
  });
}

function spawnBoss() {
  var bossWidth = Math.min(28 + (level - 1) * 4, 56);
  var bossHeight = Math.min(28 + (level - 1) * 4, 56);
  boss = {
    x: WIDTH / 2 - bossWidth / 2,
    y: -bossHeight,
    width: bossWidth,
    height: bossHeight,
    health: 25 * level,
    active: true,
    speed: 1.5,
    lastX: WIDTH / 2 - bossWidth / 2,
    lastY: -bossHeight
  };
  bossActive = true;
}

function spawnPowerup(x, y) {
  if (powerups.length < 5 && Math.random() < 0.1) {
    var type = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
    powerups.push({
      x: x,
      y: y,
      width: POWERUP_SIZE,
      height: POWERUP_SIZE,
      type: type,
      active: true,
      lastX: x,
      lastY: y
    });
  }
}

function fireBullet() {
  bullets.push({
    x: player.x,
    y: player.y - player.height / 2,
    width: BULLET_SIZE,
    height: BULLET_SIZE,
    speed: 5,
    active: true,
    lastX: player.x,
    lastY: player.y - player.height / 2
  });
}

function checkCollisions() {
  for (var i = 0; i < bullets.length; i++) {
    if (!bullets[i] || !bullets[i].active) continue;
    var bullet = bullets[i];
    for (var j = 0; j < enemies.length; j++) {
      if (!enemies[j] || !enemies[j].active) continue;
      var enemy = enemies[j];
      if (checkRectCollision(bullet.x - bullet.width/2, bullet.y - bullet.height/2, bullet.width, bullet.height, enemy.x, enemy.y, enemy.width, enemy.height)) {
        bullet.active = false;
        drawFillRect(bullet.lastX - bullet.width / 2, bullet.lastY, bullet.width, bullet.height + 2, BLACK);
        enemy.active = false;
        drawFillRect(enemy.lastX - 5, enemy.lastY - 5, enemy.width + 10, enemy.height + 10, BLACK);
        score += enemy.type.points;
        killCount++;
        createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
        spawnPowerup(enemy.x, enemy.y);
      }
    }
    if (bossActive && boss && checkRectCollision(bullet.x - bullet.width/2, bullet.y - bullet.height/2, bullet.width, bullet.height, boss.x, boss.y, boss.width, boss.height)) {
      bullet.active = false;
      drawFillRect(bullet.lastX - bullet.width / 2, bullet.lastY, bullet.width, bullet.height + 2, BLACK);
      boss.health--;
      if (boss.health <= 0) {
        bossActive = false;
        score += 500;
        killCount += 5;
        createExplosion(boss.x + boss.width/2, boss.y + boss.height/2);
        levelUp();
      }
    }
  }
  
  if (!player.invincible) {
    for (var j = 0; j < enemies.length; j++) {
      if (!enemies[j] || !enemies[j].active) continue;
      var enemy = enemies[j];
      if (checkRectCollision(player.x - player.width/2, player.y, player.width, player.height, enemy.x, enemy.y, enemy.width, enemy.height)) {
        enemy.active = false;
        drawFillRect(enemy.lastX - 5, enemy.lastY - 5, enemy.width + 10, enemy.height + 10, BLACK);
        player.lives--;
        createExplosion(player.x, player.y + player.height, true);
        player.invincible = true;
        player.invincibleTime = 60;
        if (player.lives <= 0) {
          gameState = STATE_GAME_OVER;
          if (score > highScore) highScore = score;
        }
        break;
      }
    }
    for (var j = 0; j < enemyBullets.length; j++) {
      if (!enemyBullets[j] || !enemyBullets[j].active) continue;
      var bullet = enemyBullets[j];
      if (checkRectCollision(player.x - player.width/2, player.y, player.width, player.height, bullet.x - bullet.width/2, bullet.y, bullet.width, bullet.height)) {
        bullet.active = false;
        player.lives--;
        createExplosion(player.x, player.y + player.height, true);
        player.invincible = true;
        player.invincibleTime = 60;
        if (player.lives <= 0) {
          gameState = STATE_GAME_OVER;
          if (score > highScore) highScore = score;
        }
        break;
      }
    }
    if (bossActive && boss && checkRectCollision(player.x - player.width/2, player.y, player.width, player.height, boss.x, boss.y, boss.width, boss.height)) {
      player.lives--;
      createExplosion(player.x, player.y + player.height, true);
      player.invincible = true;
      player.invincibleTime = 60;
      if (player.lives <= 0) {
        gameState = STATE_GAME_OVER;
        if (score > highScore) highScore = score;
      }
    }
  }
  
  for (var i = 0; i < powerups.length; i++) {
    if (!powerups[i] || !powerups[i].active) continue;
    var powerup = powerups[i];
    if (checkRectCollision(player.x - player.width/2, player.y, player.width, player.height, powerup.x - powerup.width/2, powerup.y, powerup.width, powerup.height)) {
      powerup.active = false;
      drawFillRect(powerup.lastX - powerup.width / 2 - 2, powerup.lastY - 2, powerup.width + 4, powerup.height + 4, BLACK);
      if (powerup.type.type === "health" && player.lives < 3) {
        player.lives++;
      } else if (powerup.type.type === "weapon" && player.weaponLevel < 3) {
        player.weaponLevel++;
        player.weaponTime = 300;
      }
    }
  }
  
  if (player.invincible) {
    player.invincibleTime--;
    if (player.invincibleTime <= 0) player.invincible = false;
  }
  if (player.weaponTime > 0) {
    player.weaponTime--;
    if (player.weaponTime <= 0) player.weaponLevel = 1;
  }
}

function checkLevelProgress() {
  if (!bossActive && killCount >= levelUpThreshold) {
    spawnBoss();
  }
}

function levelUp() {
  level++;
  killCount = 0;
  score += level * 100;
  enemies = [];
  enemyBullets = [];
  enemySpawnRate = Math.max(20, 50 - level * 5);
  enemyShootRate = Math.max(40, 100 - level * 10);
  gameState = STATE_LEVEL_UP;
}

function createExplosion(x, y, isPlayerExplosion) {
  if (explosions.length < 10) {
    var explosion = { x: x, y: y, size: EXPLOSION_MAX_SIZE, active: true, life: 10 };
    if (isPlayerExplosion) explosion.size = 16;
    explosions.push(explosion);
  }
}

function checkRectCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
  return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}

function handleInput() {
  var currentSelState = getSelPress();
  
  if (gameState === STATE_MENU) {
    if (currentSelState && !lastSelState) {
      resetGame();
    }
  } 
  else if (gameState === STATE_GAME) {
    if (!isPaused) {
      if (getPrevPress()) {
        player.x -= player.speed;
      }
      if (getNextPress()) {
        player.x += player.speed;
      }
      
      if (player.x < player.width/2) player.x = player.width/2;
      if (player.x > WIDTH - player.width/2) player.x = WIDTH - player.width/2;
      
      if (currentSelState) {
        if (frameCounter - lastFireTime >= fireRate) {
          fireBullet();
          lastFireTime = frameCounter;
        }
        
        if (currentSelState && !lastSelState) {
          if (selPressWindowStart === -1) {
            selPressWindowStart = frameCounter;
          }
          selPressCount++;
        }
        
        if (selPressWindowStart !== -1) {
          if (frameCounter - selPressWindowStart < selPressWindow) {
            if (selPressCount >= selPressThreshold) {
              isPaused = true;
              pauseDrawn = false;
              selPressCount = 0;
              selPressWindowStart = -1;
            }
          } else {
            selPressCount = 0;
            selPressWindowStart = -1;
          }
        }
      }
    } else {
      if (getNextPress()) {
        isPaused = false;
        staticDrawn = false;
        pauseDrawn = false;
      }
      if (getPrevPress()) {
        function crash() { crash(); }
        crash();
      }
    }
  } 
  else if (gameState === STATE_LEVEL_UP) {
    if (currentSelState && !lastSelState) {
      gameState = STATE_GAME;
    }
  } 
  else if (gameState === STATE_GAME_OVER) {
    if (currentSelState && !lastSelState) {
      gameState = STATE_MENU;
    }
  }
  
  lastSelState = currentSelState;
}

function main() {
  createStars();
  gameState = STATE_MENU;
  
  while (true) {
    var startTime = Date.now();
    handleInput();
    if (gameState === STATE_GAME && !isPaused) updateGame();
    drawGame();
    var frameTime = Date.now() - startTime;
    delay(Math.max(1, 40 - frameTime));
  }
}

main();