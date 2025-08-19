// Configurazione del canvas
var canvas = document.createElement("canvas");
var context = canvas.getContext("2d");
document.body.appendChild(canvas);

var WIDTH = 240;
var HEIGHT = 400;
var ROWS = 20;
var COLS = 10;
var BLOCK_SIZE = 20;

canvas.width = WIDTH;
canvas.height = HEIGHT;

// Inizializzazione della griglia di gioco
var board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

// Colori per i pezzi
var colors = [
  null,
  "cyan",   // I
  "blue",   // J
  "orange", // L
  "yellow", // O
  "green",  // S
  "purple", // T
  "red"     // Z
];

// Definizione dei pezzi
var pieces = [
  [[1, 1, 1, 1]], // I
  [[2, 0, 0], [2, 2, 2]], // J
  [[0, 0, 3], [3, 3, 3]], // L
  [[4, 4], [4, 4]], // O
  [[0, 5, 5], [5, 5, 0]], // S
  [[0, 6, 0], [6, 6, 6]], // T
  [[7, 7, 0], [0, 7, 7]]  // Z
];

var currentPiece;
var currentPosition;

// Funzione per resettare il gioco
function resetGame() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  spawnPiece();
}

// Funzione per generare un nuovo pezzo
function spawnPiece() {
  var index = Math.floor(Math.random() * pieces.length);
  currentPiece = pieces[index];
  currentPosition = { x: Math.floor(COLS / 2) - Math.floor(currentPiece[0].length / 2), y: 0 };

  if (collision()) {
    alert("Game Over!");
    resetGame();
  }
}

// Funzione per controllare le collisioni
function collision(offsetX = 0, offsetY = 0) {
  for (var y = 0; y < currentPiece.length; y++) {
    for (var x = 0; x < currentPiece[y].length; x++) {
      if (currentPiece[y][x]) {
        var newX = currentPosition.x + x + offsetX;
        var newY = currentPosition.y + y + offsetY;

        if (newX < 0 || newX >= COLS || newY >= ROWS || (newY >= 0 && board[newY][newX])) {
          return true;
        }
      }
    }
  }
  return false;
}

// Funzione per unire il pezzo alla griglia
function merge() {
  for (var y = 0; y < currentPiece.length; y++) {
    for (var x = 0; x < currentPiece[y].length; x++) {
      if (currentPiece[y][x]) {
        board[currentPosition.y + y][currentPosition.x + x] = currentPiece[y][x];
      }
    }
  }
}

// Funzione per cancellare le righe complete
function clearLines() {
  for (var y = ROWS - 1; y >= 0; y--) {
    if (board[y].every(cell => cell !== 0)) {
      board.splice(y, 1);
      board.unshift(Array(COLS).fill(0));
    }
  }
}

// Funzione per ruotare il pezzo
function rotatePiece() {
  var rotated = currentPiece[0].map((_, index) => currentPiece.map(row => row[index]).reverse());
  var originalPosition = currentPosition.x;

  if (!collision()) {
    currentPiece = rotated;
  } else {
    currentPosition.x = originalPosition; // Reset position if collision occurs
  }
}

// Funzione per disegnare il gioco
function draw() {
  context.clearRect(0, 0, WIDTH, HEIGHT);
  
  // Disegna la griglia
  for (var y = 0; y < ROWS; y++) {
    for (var x = 0; x < COLS; x++) {
      if (board[y][x]) {
        context.fillStyle = colors[board[y][x]];
        context.fillRect(x