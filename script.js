// Simple Sudoku preset puzzles (0 = empty)
const PUZZLES = [
  [
    [5,3,0, 0,7,0, 0,0,0],
    [6,0,0, 1,9,5, 0,0,0],
    [0,9,8, 0,0,0, 0,6,0],
    [8,0,0, 0,6,0, 0,0,3],
    [4,0,0, 8,0,3, 0,0,1],
    [7,0,0, 0,2,0, 0,0,6],
    [0,6,0, 0,0,0, 2,8,0],
    [0,0,0, 4,1,9, 0,0,5],
    [0,0,0, 0,8,0, 0,7,9]
  ],
  [
    [0,2,0, 6,0,8, 0,0,0],
    [5,8,0, 0,0,9, 7,0,0],
    [0,0,0, 0,4,0, 0,0,0],
    [3,7,0, 0,0,0, 5,0,0],
    [6,0,0, 0,0,0, 0,0,4],
    [0,0,8, 0,0,0, 0,1,3],
    [0,0,0, 0,2,0, 0,0,0],
    [0,0,9, 8,0,0, 0,3,6],
    [0,0,0, 3,0,6, 0,9,0]
  ]
];
let solution = [];
let currentPuzzle = [];
let prefilled = [];
const boardEl = document.getElementById('sudoku-board');
const messageEl = document.getElementById('message');

function deepCopy(mat) {
  return mat.map(row => row.slice());
}

function generatePuzzle() {
  // Pick a random puzzle
  const idx = Math.floor(Math.random() * PUZZLES.length);
  currentPuzzle = deepCopy(PUZZLES[idx]);
  prefilled = currentPuzzle.map(row => row.map(cell => cell !== 0));
  // Compute the solution for check
  solution = deepCopy(currentPuzzle);
  solve(solution);
}

function createBoard() {
  boardEl.innerHTML = '';
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = document.createElement('input');
      cell.type = 'text';
      cell.maxLength = 1;
      cell.className = 'cell';
      cell.dataset.row = r;
      cell.dataset.col = c;
      if (currentPuzzle[r][c] !== 0) {
        cell.value = currentPuzzle[r][c];
        cell.disabled = true;
        cell.classList.add('prefilled');
      } else {
        cell.value = '';
        cell.addEventListener('input', onInput);
        cell.addEventListener('keydown', onKeyDown);
      }
      boardEl.appendChild(cell);
    }
  }
}

function onInput(e) {
  let v = e.target.value.replace(/[^1-9]/g, '');
  e.target.value = v;
  if (v.length === 1) {
    checkBoard();
  }
}

function onKeyDown(e) {
  // Navigate with arrow keys
  const r = parseInt(e.target.dataset.row);
  const c = parseInt(e.target.dataset.col);
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
    let nr = r, nc = c;
    if (e.key === 'ArrowLeft') nc = Math.max(0, c - 1);
    if (e.key === 'ArrowRight') nc = Math.min(8, c + 1);
    if (e.key === 'ArrowUp') nr = Math.max(0, r - 1);
    if (e.key === 'ArrowDown') nr = Math.min(8, r + 1);
    const next = document.querySelector(`.cell[data-row='${nr}'][data-col='${nc}']`);
    if (next && !next.disabled) next.focus();
    e.preventDefault();
  }
}

function getCurrentBoard() {
  const board = [];
  for (let r = 0; r < 9; r++) {
    const row = [];
    for (let c = 0; c < 9; c++) {
      const cell = boardEl.children[r * 9 + c];
      if (cell.value === '') row.push(0);
      else row.push(Number(cell.value));
    }
    board.push(row);
  }
  return board;
}

function checkBoard() {
  const userBoard = getCurrentBoard();
  let complete = true;
  let correct = true;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = boardEl.children[r * 9 + c];
      if (prefilled[r][c]) continue;
      if (userBoard[r][c] === 0) {
        cell.style.background = '';
        complete = false;
      } else if (userBoard[r][c] !== solution[r][c]) {
        cell.style.background = '#ffe3e3';
        correct = false;
      } else {
        cell.style.background = '#b2f2bb';
      }
    }
  }
  if (complete && correct) {
    showMessage('🎉 Congratulations! Sudoku solved!', true);
  } else if (!correct) {
    showMessage('There are mistakes.', false);
  } else {
    showMessage('', false);
  }
}

function showMessage(msg, success) {
  messageEl.textContent = msg;
  messageEl.style.color = success ? '#b2f2bb' : '#fff';
}

// Sudoku solver (backtracking)
function solve(board) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) {
        for (let n = 1; n <= 9; n++) {
          if (isValid(board, r, c, n)) {
            board[r][c] = n;
            if (solve(board)) return true;
            board[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}
function isValid(board, row, col, num) {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num || board[i][col] === num) return false;
  }
  const boxRow = Math.floor(row / 3) * 3, boxCol = Math.floor(col / 3) * 3;
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 3; c++)
      if (board[boxRow + r][boxCol + c] === num) return false;
  return true;
}

document.getElementById('new-game').onclick = () => {
  generatePuzzle();
  createBoard();
  showMessage('New puzzle loaded!');
};
document.getElementById('reset-game').onclick = () => {
  createBoard();
  showMessage('Puzzle reset.');
};

window.onload = () => {
  generatePuzzle();
  createBoard();
};