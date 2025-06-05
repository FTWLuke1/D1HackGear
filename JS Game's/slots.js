var WIDTH = 240;
var HEIGHT = 135;

var BLACK = 0;
var WHITE = 16777215;
var YELLOW = 16776960;
var CYAN = 65535;
var MAGENTA = 16711935;

var SLOT_STATE_MENU = 0;
var SLOT_STATE_SPIN = 1;
var SLOT_STATE_GAME_OVER = 2;
var slotState = SLOT_STATE_MENU;
var slotMoney = 300;
var slotBetOptions = [1, 2, 3, 5, 10, 20];
var slotBetIndex = 0;
var slotReels = [0, 0, 0];
var slotSymbols = ["7", "BAR", "Bell", "Chy", "Lem"];
var slotStaticDrawn = false;
var slotLastSelState = false;
var slotMessage = "";
var slotMessageTimer = 0;

function resetSlots() {
  slotMoney = 300;
  slotBetIndex = 0;
  slotReels = [0, 0, 0];
  slotState = SLOT_STATE_SPIN;
  slotStaticDrawn = false;
  slotMessage = "";
  slotMessageTimer = 0;
}

function drawSlots() {
  if (!slotStaticDrawn) {
    fillScreen(BLACK);
    setTextSize(1);
    if (slotState === SLOT_STATE_MENU) {
      setTextSize(2);
      setTextColor(YELLOW);
      drawString("SLOTS", 90, 20);
      setTextSize(1);
      setTextColor(WHITE);
      drawString("M5: Bet", 100, 50);
      drawString("NEXT: Bet", 95, 70);
      drawString("Press M5 to Start", 80, 90);
    } else if (slotState === SLOT_STATE_SPIN) {
      setTextColor(WHITE);
      drawString("Money: " + slotMoney, 10, 10);
      drawString("PREV: Quit", 10, 30); // Changed to PREV: Quit
      drawString("Bet: " + slotBetOptions[slotBetIndex], 100, 10);
      setTextSize(2); // Reel text smaller
      setTextColor(CYAN);
      var reel1 = slotSymbols[slotReels[0]].length === 1 ? " " + slotSymbols[slotReels[0]] + " " : slotSymbols[slotReels[0]];
      var reel2 = slotSymbols[slotReels[1]].length === 1 ? " | " + slotSymbols[slotReels[1]] + " |" : " |" + slotSymbols[slotReels[1]] + "|"; // Straight brackets on both sides
      var reel3 = slotSymbols[slotReels[2]].length === 1 ? " " + slotSymbols[slotReels[2]] + " " : slotSymbols[slotReels[2]];
      
      var reelWidth = 45; // Approximate width of one reel
      var totalReelWidth = reelWidth * 3 + 30; // 3 reels + some space
      var startX = (WIDTH - totalReelWidth) / 2 - 20; // Base position
      
      drawString(String.fromCharCode(91), startX, 60); // [
      drawString(reel1, startX + 10, 60); // Left reel
      drawString(reel2, startX + 55, 60); // Middle reel
      drawString(reel3, startX + 135, 60); // Right reel
      drawString(String.fromCharCode(93), startX + 180, 60); // ]
      
      setTextSize(1);
      setTextColor(WHITE);
      drawString("M5: Spin", 10, 110);
      drawString("NEXT: Bet", 170, 110);
      if (slotMessageTimer > 0 && slotMessage !== "") {
        setTextColor(YELLOW);
        setTextSize(2); // Win message a bit bigger
        var centerX = 120 - 20; // Middle of screen minus 20
        if (slotMessage === "JACKPOT!") {
          drawString(slotMessage, centerX - 40, 110);
        } else if (slotMessage === "WIN!") {
          drawString(slotMessage, centerX - 20, 110);
        } else if (slotMessage === "Pair!") {
          drawString(slotMessage, centerX - 20, 110);
        } else if (slotMessage === "So Close!") {
          drawString(slotMessage, centerX - 40, 110);
        }
        slotMessageTimer--;
        if (slotMessageTimer <= 0) slotMessage = "";
      }
    } else if (slotState === SLOT_STATE_GAME_OVER) {
      setTextSize(2);
      setTextColor(MAGENTA);
      drawString("BUSTED!", 80, 50);
      setTextSize(1);
      setTextColor(WHITE);
      drawString("M5 to Retry", 70, 90);
      drawString("PREV: Quit", 70, 110); // Changed to PREV: Quit
    }
    slotStaticDrawn = true;
  }
}

function updateSlots(selPressed) {
  if (slotState !== SLOT_STATE_SPIN) {
    return;
  }
  var bet = slotBetOptions[slotBetIndex];
  if (slotMoney < bet) {
    slotBetIndex = Math.max(0, slotBetIndex - 1);
  }
  if (selPressed) {
    slotMoney -= bet;
    slotReels = [
      Math.floor(Math.random() * 5),
      Math.floor(Math.random() * 5),
      Math.floor(Math.random() * 5)
    ];
    slotMessage = "";
    if (slotReels[0] === 0 && slotReels[1] === 0 && slotReels[2] === 0) {
      slotMoney += bet * 50;
      slotMessage = "JACKPOT!";
      slotMessageTimer = 30;
      tone(1000, 500); // High-pitched, longer for jackpot
    } else if (slotReels[0] === slotReels[1] && slotReels[1] === slotReels[2]) {
      var multiplier = (slotReels[0] === 1 || slotReels[0] === 2) ? 20 : 10;
      slotMoney += bet * multiplier;
      slotMessage = "WIN!";
      slotMessageTimer = 20;
      tone(800, 300); // Medium-pitched for win
    } else if (slotReels[0] === slotReels[1] || slotReels[1] === slotReels[2]) {
      slotMoney += bet * 2;
      slotMessage = "Pair!";
      slotMessageTimer = 15;
      tone(600, 200); // Lower-pitched for pair
    } else {
      var twoMatch = (slotReels[0] === slotReels[1] && slotReels[1] !== slotReels[2]) ||
                     (slotReels[1] === slotReels[2] && slotReels[0] !== slotReels[1]);
      if (twoMatch) {
        slotMessage = "So Close!";
        slotMessageTimer = 15;
      }
    }
    if (slotMoney <= 0) {
      slotState = SLOT_STATE_GAME_OVER;
    }
    slotStaticDrawn = false;
  }
}

function handleInput() {
  var currentSelState = getSelPress();
  var shouldExit = false;

  switch (slotState) {
    case SLOT_STATE_MENU:
      if (currentSelState && !slotLastSelState) {
        resetSlots();
        slotStaticDrawn = false;
      }
      break;
    case SLOT_STATE_SPIN:
      if (getPrevPress()) {
        shouldExit = true; // Exit the game directly
      }
      if (getNextPress()) {
        slotBetIndex = (slotBetIndex + 1) % slotBetOptions.length;
        slotStaticDrawn = false;
      }
      updateSlots(currentSelState && !slotLastSelState);
      break;
    case SLOT_STATE_GAME_OVER:
      if (currentSelState && !slotLastSelState) {
        resetSlots();
        slotStaticDrawn = false;
      }
      if (getPrevPress()) {
        shouldExit = true; // Exit the game directly
      }
      break;
  }
  slotLastSelState = currentSelState;
  return shouldExit;
}

function main() {
  while (true) {
    var startTime = Date.now();
    if (handleInput()) {
      break; // Exit the loop and thus the script
    }
    updateSlots(false);
    drawSlots();
    var frameTime = Date.now() - startTime;
    delay(Math.max(1, 33 - frameTime)); // Aim for ~30 fps
  }
}

main();