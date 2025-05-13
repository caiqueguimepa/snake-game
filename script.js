const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("score");
const messageBox = document.getElementById("messageBox");

let gridSize = 20;
let tileCount = 20;
canvas.width = canvas.height = gridSize * tileCount;

let snake, food, direction, lastDirection, frame, running, score;

function startGame() {
  snake = [{ x: 10, y: 10 }];
  direction = { x: 0, y: 0 };
  lastDirection = { x: 0, y: 0 };
  food = randomPosition();
  frame = 0;
  score = 0;
  running = true;
  updateScore();
  messageBox.textContent = "";
  drawGame();
}

function gameLoop() {
  if (!running) return;

  requestAnimationFrame(gameLoop);
  if (++frame < 5) return;
  frame = 0;

  if (direction.x === 0 && direction.y === 0) return;

  const head = { ...snake[0] };
  head.x += direction.x;
  head.y += direction.y;

  if (
    head.x < 0 || head.x >= tileCount ||
    head.y < 0 || head.y >= tileCount ||
    snake.some(seg => seg.x === head.x && seg.y === head.y)
  ) {
    running = false;
    messageBox.textContent = `💥 Game Over! Pontuação: ${score}`;
    setTimeout(startGame, 3000);
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    updateScore();
    food = randomPosition();
  } else {
    snake.pop();
  }

  drawGame();
  lastDirection = direction;
}

function drawGame() {
  ctx.fillStyle = "#1f2937"; // fundo escuro
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawGrid();

  // comida
  ctx.fillStyle = "#f87171";
  ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);

  // cobrinha
  ctx.fillStyle = "#4ade80";
  for (const part of snake) {
    ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize - 2, gridSize - 2);
  }
}

function drawGrid() {
  ctx.strokeStyle = "#374151"; // cinza escuro
  ctx.lineWidth = 0.5;

  for (let i = 0; i <= tileCount; i++) {
    // Linhas verticais
    ctx.beginPath();
    ctx.moveTo(i * gridSize, 0);
    ctx.lineTo(i * gridSize, canvas.height);
    ctx.stroke();

    // Linhas horizontais
    ctx.beginPath();
    ctx.moveTo(0, i * gridSize);
    ctx.lineTo(canvas.width, i * gridSize);
    ctx.stroke();
  }
}

function randomPosition() {
  return {
    x: Math.floor(Math.random() * tileCount),
    y: Math.floor(Math.random() * tileCount)
  };
}

function setDirection(dir) {
  const map = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };
  const newDir = map[dir];
  if (newDir && (newDir.x !== -lastDirection.x || newDir.y !== -lastDirection.y)) {
    direction = newDir;

    if (running && lastDirection.x === 0 && lastDirection.y === 0) {
      gameLoop();
    }
  }
}

function updateScore() {
  scoreDisplay.textContent = score;
}

document.addEventListener("keydown", (e) => {
  const map = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    w: "up", a: "left", s: "down", d: "right"
  };
  if (map[e.key]) setDirection(map[e.key]);
});
