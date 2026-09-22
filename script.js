/**
 * Fiz Tic Tac Toe - Logic and Effects Controller
 */

// ==========================================================================
// 1. GAME STATE MANAGEMENT
// ==========================================================================
const GameState = {
  board: Array(9).fill(""),
  currentPlayer: "X",
  gameMode: "single",
  isGameActive: false,
  players: {
    X: "Player 1",
    O: "Computer"
  },
  scores: {
    X: 0,
    O: 0,
    ties: 0
  },
  
  resetBoard() {
    this.board = Array(9).fill("");
    this.currentPlayer = "X";
    this.isGameActive = true;
  },

  resetAll() {
    this.resetBoard();
    this.scores = { X: 0, O: 0, ties: 0 };
  }
};

// ==========================================================================
// 2. UI & ANIMATION CONTROLLER
// ==========================================================================
const UIController = {
  elements: {
    board: document.getElementById("board"),
    cells: Array.from(document.querySelectorAll(".cell")),
    status: document.getElementById("gameStatus"),
    singlePlayerBtn: document.getElementById("singlePlayerBtn"),
    twoPlayerBtn: document.getElementById("twoPlayerBtn"),
    player2Group: document.getElementById("player2Group"),
    player1Input: document.getElementById("player1Input"),
    player2Input: document.getElementById("player2Input"),
    startGameBtn: document.getElementById("startGameBtn"),
    restartBtn: document.getElementById("restartBtn"),
    resetAllBtn: document.getElementById("resetAllBtn"),
    cardX: document.getElementById("cardX"),
    cardO: document.getElementById("cardO"),
    nameDisplayX: document.getElementById("nameDisplayX"),
    nameDisplayO: document.getElementById("nameDisplayO"),
    scoreX: document.getElementById("scoreX"),
    scoreO: document.getElementById("scoreO"),
    scoreTies: document.getElementById("scoreTies")
  },

  updateCell(index, symbol) {
    const cell = this.elements.cells[index];
    cell.textContent = symbol;
    cell.setAttribute("data-mark", symbol);
    cell.disabled = true;
  },

  clearBoardUI() {
    document.body.className = ""; // Reset background effects
    this.elements.status.classList.remove("animate-text");
    this.elements.cardX.classList.remove("bounce-win");
    this.elements.cardO.classList.remove("bounce-win");

    this.elements.cells.forEach(cell => {
      cell.textContent = "";
      cell.removeAttribute("data-mark");
      cell.classList.remove("winning-cell", "invalid-flash");
      cell.disabled = false;
    });
  },

  flashInvalidCell(index) {
    const cell = this.elements.cells[index];
    cell.classList.add("invalid-flash");
    setTimeout(() => cell.classList.remove("invalid-flash"), 300);
  },

  highlightWin(winningIndices) {
    winningIndices.forEach(index => {
      this.elements.cells[index].classList.add("winning-cell");
    });
  },

  setStatus(message) {
    this.elements.status.textContent = message;
  },

  updateScoreboard() {
    this.elements.nameDisplayX.textContent = GameState.players.X;
    this.elements.nameDisplayO.textContent = GameState.players.O;
    this.elements.scoreX.textContent = GameState.scores.X;
    this.elements.scoreO.textContent = GameState.scores.O;
    this.elements.scoreTies.textContent = GameState.scores.ties;
    this.updateActiveCard();
  },

  updateActiveCard() {
    if (!GameState.isGameActive) {
      this.elements.cardX.classList.remove("active-turn");
      this.elements.cardO.classList.remove("active-turn");
      return;
    }
    if (GameState.currentPlayer === "X") {
      this.elements.cardX.classList.add("active-turn");
      this.elements.cardO.classList.remove("active-turn");
    } else {
      this.elements.cardO.classList.add("active-turn");
      this.elements.cardX.classList.remove("active-turn");
    }
  },

  disableBoard(disable = true) {
    this.elements.cells.forEach(cell => {
      if (!cell.textContent) cell.disabled = disable;
    });
  },

  // Effect: Launch Confetti Explosion
  triggerConfetti() {
    const colors = ["#ffd119", "#a348e8", "#ff4785", "#ff7e33", "#38ef7d"];
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement("div");
      confetti.classList.add("confetti-particle");
      confetti.style.left = Math.random() * 100 + "vw";
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = Math.random() * 0.5 + "s";
      confetti.style.animationDuration = 2 + Math.random() * 1.5 + "s";
      document.body.appendChild(confetti);

      setTimeout(() => confetti.remove(), 4000);
    }
  },

  // Effect: Apply Victory/Loss Styles
  triggerResultEffect(winnerSymbol) {
    this.elements.status.classList.add("animate-text");

    if (winnerSymbol === "Tie") {
      return;
    }

    const isSinglePlayer = GameState.gameMode === "single";
    const isPlayerWin = !isSinglePlayer || winnerSymbol === "X";

    if (isPlayerWin) {
      document.body.classList.add("state-win");
      this.triggerConfetti();
      const card = winnerSymbol === "X" ? this.elements.cardX : this.elements.cardO;
      card.classList.add("bounce-win");
    } else {
      // Computer Won (Defeat effect)
      document.body.classList.add("state-loss");
      this.elements.cardO.classList.add("bounce-win");
    }
  }
};

// ==========================================================================
// 3. GAME LOGIC ENGINE
// ==========================================================================
const GameEngine = {
  winningCombinations: [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ],

  checkWinner(board) {
    for (const combo of this.winningCombinations) {
      const [a, b, c] = combo;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], combo };
      }
    }
    if (board.every(cell => cell !== "")) {
      return { winner: "Tie", combo: [] };
    }
    return null;
  }
};

// ==========================================================================
// 4. SMART AI LOGIC
// ==========================================================================
const ComputerAI = {
  priorityMoves: [4, 0, 2, 6, 8, 1, 3, 5, 7],

  getBestMove(board, computerSymbol, playerSymbol) {
    const winningMove = this.findWinningMove(board, computerSymbol);
    if (winningMove !== null) return winningMove;

    const blockingMove = this.findWinningMove(board, playerSymbol);
    if (blockingMove !== null) return blockingMove;

    for (const index of this.priorityMoves) {
      if (board[index] === "") return index;
    }
    return -1;
  },

  findWinningMove(board, symbol) {
    for (let i = 0; i < board.length; i++) {
      if (board[i] === "") {
        const boardCopy = [...board];
        boardCopy[i] = symbol;
        const result = GameEngine.checkWinner(boardCopy);
        if (result && result.winner === symbol) return i;
      }
    }
    return null;
  }
};

// ==========================================================================
// 5. GAME CONTROLLER
// ==========================================================================
const GameController = {
  init() {
    this.bindEvents();
    this.setupGame();
  },

  bindEvents() {
    UIController.elements.singlePlayerBtn.addEventListener("click", () => this.setMode("single"));
    UIController.elements.twoPlayerBtn.addEventListener("click", () => this.setMode("two"));
    UIController.elements.startGameBtn.addEventListener("click", () => this.setupGame());
    UIController.elements.restartBtn.addEventListener("click", () => this.restartRound());
    UIController.elements.resetAllBtn.addEventListener("click", () => this.resetAll());

    UIController.elements.board.addEventListener("click", (e) => {
      if (e.target.classList.contains("cell")) {
        const index = parseInt(e.target.getAttribute("data-index"));
        this.handleCellClick(index);
      }
    });
  },

  setMode(mode) {
    GameState.gameMode = mode;
    if (mode === "single") {
      UIController.elements.singlePlayerBtn.classList.add("active");
      UIController.elements.twoPlayerBtn.classList.remove("active");
      UIController.elements.player2Group.style.display = "flex";
      UIController.elements.player2Input.value = "Computer";
      UIController.elements.player2Input.disabled = true;
    } else {
      UIController.elements.twoPlayerBtn.classList.add("active");
      UIController.elements.singlePlayerBtn.classList.remove("active");
      UIController.elements.player2Group.style.display = "flex";
      UIController.elements.player2Input.value = "Player 2";
      UIController.elements.player2Input.disabled = false;
    }
  },

  setupGame() {
    GameState.players.X = UIController.elements.player1Input.value.trim() || "Player 1";
    GameState.players.O = UIController.elements.player2Input.value.trim() || (GameState.gameMode === "single" ? "Computer" : "Player 2");
    this.restartRound();
  },

  handleCellClick(index) {
    if (!GameState.isGameActive || GameState.board[index] !== "") {
      UIController.flashInvalidCell(index);
      return;
    }

    this.makeMove(index, GameState.currentPlayer);

    if (GameState.isGameActive && GameState.gameMode === "single" && GameState.currentPlayer === "O") {
      UIController.disableBoard(true);
      UIController.setStatus(`${GameState.players.O} is thinking...`);
      
      setTimeout(() => {
        const computerIndex = ComputerAI.getBestMove(GameState.board, "O", "X");
        if (computerIndex !== -1 && GameState.isGameActive) {
          this.makeMove(computerIndex, "O");
        }
        UIController.disableBoard(false);
      }, 500);
    }
  },

  makeMove(index, symbol) {
    GameState.board[index] = symbol;
    UIController.updateCell(index, symbol);

    const result = GameEngine.checkWinner(GameState.board);

    if (result) {
      this.handleGameEnd(result);
    } else {
      GameState.currentPlayer = GameState.currentPlayer === "X" ? "O" : "X";
      UIController.setStatus(`${GameState.players[GameState.currentPlayer]}'s Turn (${GameState.currentPlayer})`);
      UIController.updateActiveCard();
    }
  },

  handleGameEnd(result) {
    GameState.isGameActive = false;
    UIController.updateActiveCard();

    if (result.winner === "Tie") {
      GameState.scores.ties++;
      UIController.setStatus("🤝 Game Ended in a Tie!");
    } else {
      GameState.scores[result.winner]++;
      UIController.highlightWin(result.combo);
      UIController.setStatus(`🎉 ${GameState.players[result.winner]} Wins!`);
    }

    UIController.triggerResultEffect(result.winner);
    UIController.updateScoreboard();
  },

  restartRound() {
    GameState.resetBoard();
    UIController.clearBoardUI();
    UIController.updateScoreboard();
    UIController.setStatus(`${GameState.players.X}'s Turn (X)`);
  },

  resetAll() {
    GameState.resetAll();
    UIController.clearBoardUI();
    UIController.updateScoreboard();
    UIController.setStatus("Game Reset. Press Start!");
  }
};

document.addEventListener("DOMContentLoaded", () => {
  GameController.init();
});