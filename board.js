var Board = function(table) {
  var self = this;
  this.enabled = false; // the game object controls when the board is enabled
  this.htmlCells = []; // the html representation of the board
  this.board = []; // the board matrix, used to represent the game state
  this.symbol = null; // the symbol player plays with

  // cache filled/total cells so we don't have to loop on each move
  this.filledCells = 0;
  this.totalCells = 9;

  // init web
  if(typeof(document) != 'undefined') {
    (function() {
      var rows = Array.prototype.slice.call(table.getElementsByTagName("tr"));
      for (var i in rows) {
        self.htmlCells[i] = Array.prototype.slice.call(
          rows[i].getElementsByTagName("td")
        );
        if (self.htmlCells[i].length != rows.length) {
          throw new Error(
            "The table should have the same number of rows and columns"
          );
        }
        self.board[i] = [];
        for (var j in self.htmlCells[i]) {
          self.board[i][j] = null;
          self.htmlCells[i][j].innerHTML = "";
          self.htmlCells[i][j].setAttribute("data-row", i);
          self.htmlCells[i][j].setAttribute("data-cell", j);
        }
      }
    })();

    // handle user input
    table.onclick = function(event) {
      if (!self.enabled) {
        return false;
      }
      var row = event.target.getAttribute("data-row"),
        cell = event.target.getAttribute("data-cell");
  
      self.set(row, cell, self.symbol);
    };

    // event handling
    var fireEvent = function(eventName, data) {
      var event = document.createEvent("CustomEvent");
      event.initCustomEvent(eventName, true, true, data);
      document.dispatchEvent(event);
    };
  
  // init cli
  } else {
    (function() {
      for (var i = 0; i < 3; i++) {
        self.board[i] = [];
        for (var j = 0; j < 3; j++) {
          self.board[i][j] = null;
        }
      }
    })();

    // event handling
    var fireEvent = function(eventName, data) {
      self.emitEvent(eventName, data);
    };
  }

  // fill table cell with value
  this.set = function(row, cell, value) {
    if (typeof this.board[row] == "undefined") {
      throw new Error(
        "invalid value " +
          row +
          " for row, must be in [0.." +
          this.board.length +
          "]"
      );
    }
    if (typeof this.board[row][cell] == "undefined") {
      throw new Error(
        "invalid value " +
          cell +
          " for cell, must be in [0.." +
          this.board[row].length +
          "]"
      );
    }
    if (this.board[row][cell] !== null) {
      return false;
    }
    this.board[row][cell] = value;
    if(typeof(document) != 'undefined') {
      this.htmlCells[row][cell].textContent = value;
    }
    this.filledCells++;

    fireEvent("board:set", { row: row, cell: cell, symbol: value });

    var gameOver = this.isWinning(row, cell);
    if (!gameOver) {
      gameOver = this.isFull();
    }

    return true;
  };

  // check if there's a winner
  this.isWinning = function(row, cell) {
    var h = (v = d1 = d2 = 0),
      boardSize = this.board.length,
      value = this.board[row][cell];
    for (i = 0; i < boardSize; i++) {
      // check if all of the values are same...
      // ... at the row
      if (this.board[row][i] === value) h++;
      // ... at the column
      if (this.board[i][cell] === value) v++;
      // at the main diagonal
      if (this.board[i][i] === value) d1++;
      // at the secondary diagonal
      if (this.board[i][boardSize - 1 - i] === value) d2++;
    }

    if (
      h == boardSize ||
      v == boardSize ||
      d1 == boardSize ||
      d2 == boardSize
    ) {
      fireEvent("board:winning", value);
      return true;
    }
    return false;
  };

  // if board is full then game over
  this.isFull = function() {
    var isFull = this.filledCells == this.totalCells;
    if (isFull) {
      fireEvent("board:full");
    }
    return isFull;
  };
};

if(typeof(require) != 'undefined') {
  var EventEmitter = require('events').EventEmitter;
  var util = require('util');
  util.inherits(Board, EventEmitter);

  Board.prototype.emitEvent = function(eventName, data) {
    this.emit(eventName, data);
  };

  module.exports = Board;
}