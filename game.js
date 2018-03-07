var Game = function(table) {
  var board = new Board(table);
  var connection = new Connection();
  var room = "";

  var setEventListeners = function(isPlayer) {
    if (isPlayer) {
      // handle user input
      document.addEventListener("board:set", function(event) {
        var is_your_move = event.detail.symbol == board.symbol;
        if (is_your_move) {
          connection.send(room, "set", event.detail, onOpponentMove);
          Game.message("Waiting for other player to move");
          board.enabled = false;
        } else {
          Game.message("Your turn");
          board.enabled = true;
        }
      });
    } else {
      document.addEventListener("board:set", wait);
    }
    // handle game over scenarios
    document.addEventListener("board:winning", function(event) {
      msg = "Game Over";
      if (isPlayer) {
        msg = event.detail + " wins";
        board.enabled = false;
      }
      Game.message(msg);
    });
    document.addEventListener("board:full", function(event) {
      Game.message("Game over");
      board.enabled = false;
    });
  };

  var onOpponentMove = function(data) {
    board.set(data.value.row, data.value.cell, data.value.symbol);
  };

  var wait = function() {
    connection.send(room, "wait", null, onOpponentMove);
  };

  var onGameStart = function(data) {
    if (data.player == 1) {
      board.symbol = "X";
      Game.message("Your turn");
      board.enabled = true;
      setEventListeners(true);
    } else if (data.player == 2) {
      board.symbol = "O";
      Game.message("Waiting for other player to move");
      setEventListeners(true);
      wait();
    } else {
      Game.message("Room full");
    }
  };

  this.start = function(newRoom) {
    room = newRoom;
    connection.send(room, "init", null, onGameStart);
    Game.message("Waiting for other player");
  };
};

Game.message = function(msg) {
  document.getElementById("message").textContent = msg;
};
