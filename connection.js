Connection = function() {
  var xhr = new XMLHttpRequest();
  var url = "http://localhost:8123";
  var gameCallback = function() {};
  var lastRoom = null;
  var lastCommand = null;
  var lastValue = null;
  var timeout = 2;
  var self = this;

  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      gameCallback(JSON.parse(xhr.responseText));
      // reset the timeout to default
      timeout = 1;
    }
  };

  xhr.onerror = function() {
    Game.message(
      "There is a problem with the connection. Reconnect in " +
        timeout +
        " seconds"
    );
    window.setTimeout(function() {
      Game.message("Reconnecting...");
      self.send(lastRoom, lastCommand, lastValue, gameCallback);
    }, timeout * 1000);
    if (timeout < 10) {
      timeout += 1;
    }
  };

  this.send = function(room, command, value, callback) {
    lastRoom = room;
    lastCommand = command;
    lastValue = value;
    gameCallback = callback;
    var data = {
      room: room,
      command: command,
      value: value
    };
    xhr.open("POST", url);
    xhr.send(JSON.stringify(data));
  };

  this.stop = function() {
    xhr.abort();
  };
};
