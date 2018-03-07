#! /usr/bin/env node

var http = require("http");
var readline = require("readline");
var rl = readline.createInterface(process.stdin, process.stdout);

var room = "";
var Board = require("./board");
var board = new Board();

var boardRows = {
  1: { row: 0, cell: 0 },
  2: { row: 0, cell: 1 },
  3: { row: 0, cell: 2 },
  4: { row: 1, cell: 0 },
  5: { row: 1, cell: 1 },
  6: { row: 1, cell: 2 },
  7: { row: 2, cell: 0 },
  8: { row: 2, cell: 1 },
  9: { row: 2, cell: 2 },
};

var sendReq = function(room, command, value, callback) {
  var payload = JSON.stringify(
    (data = {
      room: room,
      command: command,
      value: value
    })
  );

  var options = {
    hostname: "127.0.0.1",
    port: 8123,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": payload.length
    }
  };

  var request = http.request(options, function(response) {
    var body = "";
    response.on("data", function(chunk) {
      body += chunk;
    });
    response.on("end", function() {
      callback(JSON.parse(body));
    });
  });
  request.write(payload);
  request.end();
};

var setEventListeners = function(isPlayer) {
  if (isPlayer) {
    board.on("board:set", function(event) {
      var is_your_move = event.symbol == board.symbol;
      if (is_your_move) {
        sendReq(room, "set", event, onOpponentMove);
        board.printCli();
        console.log("Waiting for other player to move");
        board.enabled = false;
      } else {
        board.printCli();
        console.log("Your turn. Enter a cell from 1 to 9");
        board.enabled = true;
      }
    });
  } else {
    board.on("board:set", wait);
  }
  board.on("board:winning", function(event) {
    msg = "Game Over";
    if (isPlayer) {
      msg = event + " wins";
      board.enabled = false;
    }
    console.log(msg);
  });
  board.on("board:full", function(event) {
    console.log("Game over");
    board.enabled = false;
  });
};

var onOpponentMove = function(data) {
  board.set(data.value.row, data.value.cell, data.value.symbol);
};

var wait = function() {
  sendReq(room, "wait", null, onOpponentMove);
};

var onGameStart = function(data) {
  if (data.player == 1) {
    board.symbol = "X";
    console.log("Your turn. Enter a cell from 1 to 9");
    board.enabled = true;
    setEventListeners(true);
  } else if (data.player == 2) {
    board.symbol = "O";
    console.log("Waiting for other player to move");
    setEventListeners(true);
    wait();
  }
};

// start asking user for input
rl.setPrompt("Enter room name: ");
rl.prompt();
rl.on("line", function(line) {
  if(room == "") {
    room = line;
    console.log("Waiting for opponent");
    sendReq(room, "init", null, onGameStart);
  } else {
    board.set(boardRows[line].row, boardRows[line].cell, board.symbol);
  }
});