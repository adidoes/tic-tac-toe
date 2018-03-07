var assert = require("assert"),
  http = require("http");

var server = require("../server");
var Board = require("../board");
var board = new Board();

describe("server", function() {
  it("should return 200", function(done) {
    http.get("http://localhost:8123", function(res) {
      assert.equal(200, res.statusCode);
      done();
    });
  });
});

describe("board", function() {
  describe("filledCells", function() {
    it("should be 0", function() {
      assert.equal(0, board.filledCells);
    });
  });
  describe("board[0][0]", function() {
    it("board[0][0] should be null", function() {
      assert.equal(null, board.board[0][0]);
    });
  });
});
