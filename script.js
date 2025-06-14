// PUZZLE SETS
const PUZZLES = {
  easy: [
    [
      [0, 0, 3, 0, 2, 0, 6, 0, 0],
      [9, 0, 0, 3, 0, 5, 0, 0, 1],
      [0, 0, 1, 8, 0, 6, 4, 0, 0],
      [0, 0, 8, 1, 0, 2, 9, 0, 0],
      [7, 0, 0, 0, 0, 0, 0, 0, 8],
      [0, 0, 6, 7, 0, 8, 2, 0, 0],
      [0, 0, 2, 6, 0, 9, 5, 0, 0],
      [8, 0, 0, 2, 0, 3, 0, 0, 9],
      [0, 0, 5, 0, 1, 0, 3, 0, 0]
    ]
  ],
  medium: [
    [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ]
  ],
  hard: [
    [
      [0, 0, 0, 0, 0, 0, 0, 0, 1],
      [3, 0, 0, 0, 0, 0, 2, 0, 0],
      [0, 0, 0, 7, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 6, 0, 0, 0, 0],
      [5, 0, 0, 0, 0, 0, 0, 0, 8],
      [0, 0, 0, 0, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 9, 0, 0, 0],
      [0, 0, 4, 0, 0, 0, 0, 0, 5],
      [9, 0, 0, 0, 0, 0, 0, 0, 0]
    ]
  ]
};

let currentPuzzle = [];
let prefilled = [];
let solution = [];
let gameCompleted = false;
const boardEl = document.getElementById("sudoku-board");
const autoCheckEl = document.getElementById("auto-check");
const difficultyEl = document.getElementById("difficulty-select");

// UTIL
function deepCopy(grid) {
  return JSON.parse(JSON.stringify(grid));
}

function solve(grid) {
  const findEmpty = () => {
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++)
        if (grid[r][c] === 0) return [r, c];
    return null;
  };

  const isValid = (num, pos) => {
    const [r, c] = pos;
    for (let i = 0; i < 9; i++) {
      if (grid[r][i] === num && i !== c) return false;
      if (grid[i][c] === num && i !== r) return false;
    }
    const boxRow = Math.floor(r / 3) * 3;
    const boxCol = Math.floor(c / 3) * 3;
    for (let i = boxRow; i < boxRow + 3; i++)
      for (let j = boxCol; j < boxCol + 3; j++)
        if (grid[i][j] === num && (i !== r || j !== c)) return false;
    return true;
  };

  const helper = () => {
    const empty = findEmpty();
    if (!empty) return true;
    const [r, c] = empty;
    for (let num = 1; num <= 9; num++) {
      if (isValid(num, [r, c])) {
        grid[r][c] = num;
        if (helper()) return true;
        grid[r][c] = 0;
      }
    }
    return false;
  };

  helper();
}

// TIMER
let startTime, timerInterval;

function startTimer() {
  startTime = Date.now();
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const min = Math.floor(elapsed / 60).toString().padStart(2, "0");
    const sec = (elapsed % 60).toString().padStart(2, "0");
    document.querySelector(".timer").textContent = `⏱️ ${min}:${sec}`;
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

// BOARD RENDER
function createBoard() {
  boardEl.innerHTML = '';
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const input = document.createElement("input");
      input.type = "text";
      input.maxLength = 1;
      input.inputMode = 'numeric';
      input.pattern = '[1-9]*';
      input.classList.add("cell");

      if (prefilled[r][c]) {
        input.value = currentPuzzle[r][c];
        input.disabled = true;
        input.classList.add("prefilled");
      } else {
        input.addEventListener("input", () => {
          const val = parseInt(input.value);
          if (!autoCheckEl.checked) return;
          if (val === solution[r][c]) {
            input.classList.add("correct");
            input.classList.remove("incorrect");
          } else {
            input.classList.add("incorrect");
            input.classList.remove("correct");
          }
          checkCompletion();
        });
      }

      boardEl.appendChild(input);
    }
  }
}

function checkCompletion() {
  const cells = boardEl.querySelectorAll("input");
  for (let i = 0; i < cells.length; i++) {
    if (!cells[i].classList.contains("prefilled")) {
      const val = parseInt(cells[i].value);
      const r = Math.floor(i / 9);
      const c = i % 9;
      if (val !== solution[r][c]) return false;
    }
  }
  if (!gameCompleted) {
    gameCompleted = true;
    stopTimer();
    showMessage("🎉 Puzzle Completed!");
    launchConfetti();
  }
}

// GAME LOGIC
function showMessage(msg) {
  document.getElementById("message").textContent = msg;
}

function generatePuzzle() {
  stopTimer();
  const level = difficultyEl.value;

  // Update difficulty label
  document.querySelector('.difficulty-level').textContent = level.charAt(0).toUpperCase() + level.slice(1);

  const pool = PUZZLES[level];
  currentPuzzle = deepCopy(pool[Math.floor(Math.random() * pool.length)]);
  prefilled = currentPuzzle.map(row => row.map(cell => cell !== 0));
  solution = deepCopy(currentPuzzle);
  solve(solution);
  gameCompleted = false;
  startTimer();
}

// BUTTONS
document.getElementById("new-game").onclick = () => {
  const btn = document.getElementById("new-game");
  const text = btn.querySelector(".btn-text");
  text.textContent = "Loading...";
  btn.style.opacity = "0.8";
  setTimeout(() => {
    generatePuzzle();
    createBoard();
    showMessage("New puzzle loaded!");
    text.textContent = "New Game";
    btn.style.opacity = "1";
  }, 500);
};

// Add event listener for difficulty select
difficultyEl.addEventListener('change', () => {
  generatePuzzle();
  createBoard();
  showMessage(`Difficulty changed to ${difficultyEl.value}!`);
});

document.getElementById("reset-game").onclick = () => {
  const cells = boardEl.children;
  for (let i = 0; i < cells.length; i++) {
    if (!cells[i].classList.contains("prefilled")) {
      cells[i].value = "";
      cells[i].classList.remove("correct", "incorrect");
    }
  }
  gameCompleted = false;
  showMessage("Puzzle reset");
};

function addTouchSupport() {
  // touch to focus cells
  boardEl.addEventListener('touchstart', e => {
    if (e.target.classList.contains('cell') && !e.target.disabled) {
      e.target.focus();
    }
  });
  // arrow-key nav + digit entry
  document.addEventListener('keydown', e => {
    const active = document.activeElement;
    if (!active.classList.contains('cell')) return;
    const cells = Array.from(boardEl.children);
    let idx = cells.indexOf(active);
    let row = Math.floor(idx / 9), col = idx % 9;
    if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
      switch (e.key) {
        case 'ArrowUp':    row = (row + 8) % 9; break;
        case 'ArrowDown':  row = (row + 1) % 9; break;
        case 'ArrowLeft':  col = (col + 8) % 9; break;
        case 'ArrowRight': col = (col + 1) % 9; break;
      }
      cells[row * 9 + col].focus();
      e.preventDefault();
    } else if (/^[1-9]$/.test(e.key)) {
      if (!active.disabled) {
        active.value = e.key;
        active.dispatchEvent(new Event('input'));
      }
      e.preventDefault();
    }
  });
}

// CONFETTI
function launchConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const ctx = canvas.getContext("2d");
  const pieces = Array.from({ length: 150 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height - canvas.height,
    r: Math.random() * 6 + 4,
    c: `hsl(${Math.random() * 360}, 70%, 60%)`,
    s: Math.random() * 3 + 2,
    shape: Math.random() > 0.5 ? 'circle' : 'square'
  }));
  let frame = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of pieces) {
      ctx.beginPath();
      if (p.shape === 'circle') {
        ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
      } else {
        ctx.rect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
      }
      ctx.fillStyle = p.c;
      ctx.fill();
      p.y += p.s;
      p.x += Math.sin(frame * 0.01 + pieces.indexOf(p)) * 2;
      if (p.y > canvas.height) p.y = 0;
    }
    frame++;
    if (frame < 200) requestAnimationFrame(draw);
    else canvas.style.display = 'none';
  }
  canvas.style.display = 'block';
  draw();
}

// THEME TOGGLE
function setTheme(theme) {
  document.body.classList.toggle('light-theme', theme === 'light');
  document.getElementById('theme-toggle').textContent = theme === 'light' ? '🌞' : '🌙';
  try {
    localStorage.setItem('theme', theme);
  } catch (e) {
    console.log('Unable to save theme preference');
  }
}

document.getElementById('theme-toggle').addEventListener('click', () => {
  const newTheme = document.body.classList.contains('light-theme') ? 'dark' : 'light';
  setTheme(newTheme);
});

window.onload = () => {
  let savedTheme = 'dark';
  try {
    savedTheme = localStorage.getItem('theme') || 'dark';
  } catch (e) {
    console.log('Unable to load theme preference');
  }
  setTheme(savedTheme);
  generatePuzzle();
  createBoard();
  addTouchSupport();
  
  // Add fade-in animation to the board
  setTimeout(() => {
    document.querySelector('.container').classList.add('fade-in');
  }, 100);
};