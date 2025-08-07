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
  const setToken = (row, column, player) => {
    if (board[row][column].getValue()) {
      return false;
    } else {
      board[row][column].addToken(player);
      return true;
    }
  };

  const printBoard = () => {
    const boardWithCellValues = board.map((row) =>
      row.map((cell) => cell.getValue()),
    );
    console.log(boardWithCellValues);
  };

  return { getBoard, setToken, printBoard };
}

function Cell() {
  let value = null;

  // Accept a player's token to change the value of the cell
  const addToken = (player) => {
    value = player;
  };

  // How we will retrieve the current value of this cell through closure
  const getValue = () => value;

  return {
    addToken,
    getValue,
  };
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
  let count = 0;
  const board = Gameboard();

  const players = [
    {
      name: playerOneName,
      token: "○",
      score: 0,
    },
    {
      name: playerTwoName,
      token: "✕",
      score: 0,
    },
  ];
  let activePlayer = players[0];

  const switchPlayerTurn = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };
  const getActivePlayer = () => activePlayer;

  const printNewRound = () => {
    board.printBoard();
    if (checkWinner(board.getBoard())) {
      console.log(`${getActivePlayer().name} wins!`);
    } else if (count === 9) {
      board.printBoard();
      console.log("It's a tie!");
    } else {
      console.log(
        `${getActivePlayer().name} (${getActivePlayer().token})'s turn.`,
      );
    }
  };

  const playRound = (column, row) => {
    if (board.setToken(row, column, getActivePlayer().token)) {
      console.log(
        `Drawing ${getActivePlayer().name}'s token into ${column},${row}...`,
      );
      count++;
      switchPlayerTurn();
    } else {
      console.log(`Not allowed to draw over, choose a different cell`);
    }
    printNewRound();
  };

  printNewRound();

  // For the console version, we will only use playRound, but we will need
  // getActivePlayer for the UI version, so I'm revealing it now
  return {
    playRound,
    getActivePlayer,
    getBoard: board.getBoard,
  };
}

function ScreenController() {
  const game = GameController();
  const playerTurnDiv = document.querySelector(".turn");
  const boardDiv = document.querySelector(".board");

  const updateScreen = () => {
    // clear the board
    boardDiv.textContent = "";

    // get the newest version of the board and player turn
    const board = game.getBoard();
    const activePlayer = game.getActivePlayer();

    // Display player's turn
    playerTurnDiv.textContent = `${activePlayer.name}'s turn...`;

    // Render board squares
    board.forEach((row, i) => {
      row.forEach((cell, j) => {
        // Anything clickable should be a button!!
        const cellButton = document.createElement("button");
        cellButton.classList.add("cell");
        // Create a data attribute to identify the column
        // This makes it easier to pass into our `playRound` function
        cellButton.dataset.column = j;
        cellButton.dataset.row = i;
        cellButton.textContent = cell.getValue();
        boardDiv.appendChild(cellButton);
      });
    });
  };

  // Add event listener for the board
  function clickHandlerBoard(e) {
    const selectedColumn = e.target.dataset.column;
    const selectedRow = e.target.dataset.row;
    // Make sure I've clicked a column and not the gaps in between
    if (!selectedColumn && !selectedRow) return;

    game.playRound(selectedColumn, selectedRow);
    updateScreen();
  }
  boardDiv.addEventListener("click", clickHandlerBoard);

  // Initial render
  updateScreen();

  // We don't need to return anything from this module because everything is encapsulated inside this screen controller.
}

ScreenController();
