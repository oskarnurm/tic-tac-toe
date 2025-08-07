function Gameboard() {
  const rows = 3;
  const columns = 3;
  const board = [];

  for (let i = 0; i < rows; i++) {
    board[i] = [];
    for (let j = 0; j < columns; j++) {
      board[i].push(Cell());
    }
  }

  const getBoard = () => board;

  const isFull = () => rows * columns;

  const setToken = (row, column, token) => {
    if (board[row][column].getValue()) {
      return false;
    } else {
      board[row][column].addToken(token);
      return true;
    }
  };

  return { getBoard, setToken, isFull };
}

function Cell() {
  let value = null;

  const addToken = (token) => {
    value = token;
  };

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

function GameController(
  playerOneName = "Player One",
  playerTwoName = "Player Two",
) {
  let drawCount = 0;
  const board = Gameboard();

  const players = [
    { name: playerOneName, token: "O", score: 0 },
    { name: playerTwoName, token: "X", score: 0 },
  ];

  let activePlayer = players[0];

  const setPlayerNames = (playerOne, playerTwo) => {
    players[0].name = playerOne.trim();
    players[1].name = playerTwo.trim();
  };

  const switchPlayerTurn = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };

  const getActivePlayer = () => activePlayer;

  const getPlayers = () => players;

  const resetPlayerScores = () => {
    ((players[0].score = 0), (players[1].score = 0));
  };

  const getWinner = () => checkWinner(board.getBoard());

  const isTie = () => drawCount === board.isFull() && !getWinner();

  const playRound = (column, row) => {
    // Don't let the user set a token to a cell that already has one
    if (!board.setToken(row, column, getActivePlayer().token)) {
      return;
    }
    drawCount++;

    // Check for win
    if (checkWinner(board.getBoard())) {
      return;
    }

    // Check for tie
    if (drawCount === board.isFull()) {
      return;
    }

    switchPlayerTurn();
  };

  const resetRound = () => {
    drawCount = 0;
    activePlayer = players[0];
    board
      .getBoard()
      .flat()
      .forEach((cell) => cell.addToken(null));
  };

  return {
    playRound,
    getActivePlayer,
    getBoard: board.getBoard,
    getWinner,
    isTie,
    resetRound,
    resetPlayerScores,
    setPlayerNames,
    getPlayers,
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

  window.onload = () => {
    document.getElementById("welcome").showModal();
  };

  formDiv.addEventListener("submit", () => {
    const input1 = formDiv.elements.player1.value;
    const input2 = formDiv.elements.player2.value;

    // Set default names if the user did not provide any
    const playerOne = input1 === "" ? "Player One" : input1;
    const playerTwo = input2 === "" ? "Player Two" : input2;

    game.setPlayerNames(playerOne, playerTwo);
    updateScreen();
    formDiv.reset();
  });

  function updateScores() {
    const [player1, player2] = game.getPlayers();
    player1Div.textContent = `${player1.name}: ${player1.score}`;
    player2Div.textContent = `${player2.name}: ${player2.score}`;
  }

  const updateScreen = () => {
    boardDiv.textContent = "";

    // Update game info in-between rounds
    const board = game.getBoard();
    const activePlayer = game.getActivePlayer();

    if (game.getWinner()) {
      activePlayer.score++;
      popupDiv.querySelector(".result").textContent =
        `${activePlayer.name} wins!`;
      popupDiv.showModal();
    } else if (game.isTie()) {
      popupDiv.querySelector(".result").textContent = `Tie!`;
      popupDiv.showModal();
    } else {
      playerTurnDiv.textContent = `${activePlayer.name}'s turn`;
    }

    // Render board
    board.forEach((row, rowIndex) => {
      row.forEach((cell, columnIndex) => {
        const cellButton = document.createElement("button");
        cellButton.classList.add("cell");
        cellButton.dataset.column = columnIndex;
        cellButton.dataset.row = rowIndex;
        cellButton.textContent = cell.getValue();
        boardDiv.appendChild(cellButton);
      });
    });
    updateScores();
  };

  // Add event listener for the board
  function clickHandlerBoard(e) {
    const selectedColumn = e.target.dataset.column;
    const selectedRow = e.target.dataset.row;
    // Make sure I've clicked a cell and not the gaps in between
    if (!selectedColumn && !selectedRow) return;

    game.playRound(selectedColumn, selectedRow);
    updateScreen();
  }
  boardDiv.addEventListener("click", clickHandlerBoard);

  function resetRound() {
    game.resetRound();
    boardDiv.querySelectorAll(".cell").forEach((btn) => (btn.textContent = ""));
    playerTurnDiv.textContent = `${game.getActivePlayer().name}'s turn`;
  }

  popupDiv.addEventListener("close", () => {
    const response = popupDiv.returnValue;
    if (response === "next") {
      resetRound();
    } else if (response === "reset") {
      resetRound();
      game.resetPlayerScores();
      updateScores();
    } else {
      return;
    }
  });
  // Initial render
  updateScreen();
}

ScreenController();
