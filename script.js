const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("score");
const messageBox = document.getElementById("messageBox");
const rankingList = document.getElementById("ranking-list");

let gridSize = 20;
let tileCount = 20;
canvas.width = canvas.height = gridSize * tileCount;

let snake, food, direction, lastDirection, frame, running, score;
let ranking = JSON.parse(localStorage.getItem('snakeRanking')) || [];

// Inicializa o ranking
updateRanking();

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

  // Permite atravessar paredes
  if (head.x < 0) head.x = tileCount - 1;
  if (head.x >= tileCount) head.x = 0;
  if (head.y < 0) head.y = tileCount - 1;
  if (head.y >= tileCount) head.y = 0;

  // Verifica colisão com o próprio corpo
  if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
    gameOver();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    updateScore();
    food = randomPosition();
    // Aumenta a velocidade a cada 5 pontos
    if (score % 5 === 0 && frame > 2) {
      frame = Math.max(1, frame - 1);
    }
  } else {
    snake.pop();
  }

  drawGame();
  lastDirection = direction;
}

function gameOver() {
  running = false;
  messageBox.textContent = `💥 Game Over! Pontuação: ${score}`;
  
  // Atualiza o ranking
  updateRanking(score);
  
  setTimeout(startGame, 3000);
}

function drawGame() {
  ctx.fillStyle = "#1f2937"; // fundo escuro
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawGrid();

  // comida
  ctx.fillStyle = "#f87171";
  ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);

  // cobrinha
  snake.forEach((part, index) => {
    // Cabeça em cor diferente
    if (index === 0) {
      ctx.fillStyle = "#22c55e"; // cabeça verde mais claro
    } else {
      // Corpo com gradiente de cor
      const intensity = 0.7 - (index / snake.length) * 0.5;
      ctx.fillStyle = `rgb(74, 222, 128, ${intensity})`;
    }
    ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize - 2, gridSize - 2);
  });
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
  let position;
  // Garante que a comida não apareça na cobra
  do {
    position = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount)
    };
  } while (snake.some(seg => seg.x === position.x && seg.y === position.y));
  
  return position;
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

function updateRanking(newScore = null) {
  if (newScore !== null) {
    ranking.push(newScore);
    ranking.sort((a, b) => b - a); // Ordena decrescente
    ranking = ranking.slice(0, 5); // Mantém apenas as top 5
    localStorage.setItem('snakeRanking', JSON.stringify(ranking));
  }
  
  // Atualiza a exibição
  const items = rankingList.querySelectorAll('li');
  items.forEach((item, index) => {
    item.textContent = ranking[index] ? `${ranking[index]} pontos` : '-';
  });
}

// Controles por toque para mobile
document.getElementById('controls').addEventListener('touchstart', (e) => {
  e.preventDefault(); // Evita comportamento padrão do toque
}, { passive: false });

// Controles por teclado
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