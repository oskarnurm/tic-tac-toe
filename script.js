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

  return { getBoard, setToken, printBoard, isFull };
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
  let drawCount = 0;
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

  const getPlayerScores = () => `${players[0].name}: ${players[0].score}
                                ${players[1].name}: ${players[1].score}`;

  const getWinner = () => checkWinner(board.getBoard());

  const isTie = () => drawCount === board.isFull() && !getWinner();

  const printNewRound = (status = "") => {
    board.printBoard();
    if (status === "win") {
      console.log(`${getActivePlayer().name} wins!`);
    } else if (status === "tie") {
      console.log("It's a tie!");
    } else {
      console.log(`${getActivePlayer().name}'s turn...`);
    }
  };

  const playRound = (column, row) => {
    // Only do legal draws
    if (!board.setToken(row, column, getActivePlayer().token)) {
      console.log("Not allowed to draw over, choose a different cell");
      printNewRound();
      return;
    }
    console.log(
      `Drawing ${getActivePlayer().name}'s token into cell (${row}, ${column})`,
    );
    drawCount++;

    // Check for win
    if (checkWinner(board.getBoard())) {
      printNewRound("win");
      return;
    }

    // Check for tie
    if (drawCount === board.isFull()) {
      printNewRound("tie");
      return;
    }

    switchPlayerTurn();
    printNewRound();
  };

  const resetGame = () => {
    drawCount = 0;
    activePlayer = players[0];
    board
      .getBoard()
      .flat()
      .forEach((cell) => cell.addToken(null));
    console.clear();
    printNewRound();
  };

  printNewRound();

  return {
    playRound,
    getActivePlayer,
    getBoard: board.getBoard,
    getWinner,
    isTie,
    resetGame,
    getPlayerScores,
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
