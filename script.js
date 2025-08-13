function Gameboard() {
  const board = [];
  for (let i = 0; i < 3; i++) {
    board[i] = [];
    for (let j = 0; j < 3; j++) {
      board[i].push(Cell());
    }
  }

  const getBoard = () => board;
  const capacity = () => 9;
  const setToken = (row, col, token) => {
    // Guard against setting token to a cell that already has one
    if (board[row][col].getValue()) return false;
    board[row][col].addToken(token);
    return true;
  };

  return { getBoard, setToken, capacity };
}

function Cell() {
  let value = null;

  const addToken = (token) => (value = token);
  const getValue = () => value;

  return { addToken, getValue };
}

function checkWinner(board) {
  const flatBoard = board.flat().map((cell) => cell.getValue());
  const winningCombos = [
    [0, 1, 2], // top row
    [3, 4, 5], // middle row
    [6, 7, 8], // bottom row
    [0, 3, 6], // left column
    [1, 4, 7], // middle column
    [2, 5, 8], // right column
    [0, 4, 8], // diagonal top-left to bottom-right
    [2, 4, 6], // diagonal top-right to bottom-left
  ];

  return winningCombos.some((combo) => {
    return (
      flatBoard[combo[0]] &&
      flatBoard[combo[0]] === flatBoard[combo[1]] &&
      flatBoard[combo[0]] === flatBoard[combo[2]]
    );
  });
}

function GameController(p1 = "Player One", p2 = "Player Two") {
  let moves = 0;
  let gameOver = false;
  const board = Gameboard();

  const players = [
    { name: p1, token: "O", score: 0 },
    { name: p2, token: "X", score: 0 },
  ];

  const setPlayerNames = (a, b) => {
    players[0].name = (a ?? "").trim() || "Player One";
    players[1].name = (b ?? "").trim() || "Player Two";
  };

  let startingPlayerIndex = 0;
  let activePlayer = players[startingPlayerIndex];
  const switchPlayerTurn = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };

  const getActivePlayer = () => activePlayer;
  const getPlayers = () => players;
  const isGameOver = () => gameOver;
  const isWinner = () => checkWinner(board.getBoard());
  const isTie = () => moves === board.capacity() && !isWinner();

  const playRound = (row, col) => {
    if (gameOver) return { state: "locked" };
    // Don't let the user set a token to a cell that already has one
    if (!board.setToken(row, col, activePlayer.token))
      return { state: "invalid" };

    moves++;

    if (isWinner()) {
      activePlayer.score++;
      gameOver = true;
      return { state: "win", winner: activePlayer };
    }
    if (isTie()) {
      gameOver = true;
      return { state: "tie" };
    }
    switchPlayerTurn();
    return { state: "continue" };
  };

  const resetRound = () => {
    moves = 0;
    gameOver = false;
    // Alternate starting player each round
    startingPlayerIndex = startingPlayerIndex === 0 ? 1 : 0;
    activePlayer = players[startingPlayerIndex];
    board
      .getBoard()
      .flat()
      .forEach((cell) => cell.addToken(null));
  };

  const resetPlayerScores = () => {
    players[0].score = 0;
    players[1].score = 0;
  };

  return {
    playRound,
    getActivePlayer,
    getBoard: board.getBoard,
    resetRound,
    resetPlayerScores,
    setPlayerNames,
    getPlayers,
    isGameOver,
  };
}

function ScreenController() {
  const game = GameController();

  const playerTurnDiv = document.querySelector(".turn");
  const boardDiv = document.querySelector(".board");
  const popupDiv = document.getElementById("popup");
  const player1Div = document.querySelector(".score .player1");
  const player2Div = document.querySelector(".score .player2");
  const formDiv = document.querySelector(".form");

  window.onload = () => document.querySelector(".welcome").showModal();

  formDiv.addEventListener("submit", () => {
    const { player1, player2 } = formDiv.elements;
    game.setPlayerNames(player1.value, player2.value);
    formDiv.reset();
    updateScreen();
  });

  function updateScores() {
    const [player1, player2] = game.getPlayers();
    player1Div.textContent = `${player1.name}: ${player1.score}`;
    player2Div.textContent = `${player2.name}: ${player2.score}`;
  }

  const updateScreen = () => {
    boardDiv.textContent = "";
    const board = game.getBoard();
    const activePlayer = game.getActivePlayer();

    if (game.isGameOver()) {
      // Keep the board frozen; popup is handled in the click handler.
      playerTurnDiv.textContent = "";
    } else {
      playerTurnDiv.textContent = `${activePlayer.name}'s turn`;
    }

    // Render board
    board.forEach((row, rowIdx) => {
      row.forEach((cell, colIdx) => {
        const cellButton = document.createElement("button");
        cellButton.classList.add("cell");
        cellButton.dataset.column = colIdx;
        cellButton.dataset.row = rowIdx;
        cellButton.textContent = cell.getValue();
        boardDiv.appendChild(cellButton);
      });
    });

    updateScores();
  };

  // Add event listener for the board
  boardDiv.addEventListener("click", (e) => {
    if (!e.target.classList.contains("cell")) return;

    const row = Number(e.target.dataset.row);
    const col = Number(e.target.dataset.column);
    const result = game.playRound(row, col);

    if (result?.state === "win") {
      popupDiv.querySelector(".result").textContent =
        `${result.winner.name} wins!`;
      popupDiv.showModal();
    } else if (result?.state === "tie") {
      popupDiv.querySelector(".result").textContent = "Tie!";
      popupDiv.showModal();
    }

    updateScreen();
  });

  // Handle popup footer buttons
  popupDiv.addEventListener("close", () => {
    const response = popupDiv.returnValue;
    if (response === "next") {
      game.resetRound();
    } else if (response === "reset") {
      game.resetRound();
      game.resetPlayerScores?.();
    }
    updateScreen();
  });

  // Initial render
  updateScreen();
}

ScreenController();
