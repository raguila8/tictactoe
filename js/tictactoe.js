$(document).ready(function() {
		$('#dialog').dialog( {
		draggable: false,
		resizable: false,
		modal: true,
		autoOpen: false,
		closeOnEscape: false,
		show: {
			effect: "blind",
			duration: 1000
		},
		buttons : {
			Ok: function() {
				$(this).dialog("close"); // closing on OK click
			}
		}
	});

  main();
	
});

function main() {
	var game = new TicTacToe();
	game.computerLoop();
	game.gameLoop();
	game.changeOPlayer();
	game.changeXPlayer();
	game.newGame();
	game.changeBeginner();
	game.help();
}

function TicTacToe() {
	this.x = "player";
	this.o = "computer";
	this.xBegins = true;
	this.inProgress = false;
	this.turn = "x";
	this.loop = -1;
	this.boardArray = new Array(9).fill("");
  this.winningRows = [ [0,1,2], 
													 [3,4,5], 
													 [6,7,8],  
													 [0,4,8], 
													 [2,4,6],
													 [0,3,6], 
													 [1,4,7], 
													 [2,5,8] ];
	this.opponent = function() {
		var self = this;
		if (self.turn === "x") {
			self.turn = "o";
		} else {
			self.turn = "x";
		}
	};

	this.computerLoop = function() {
		var self = this;
		self.inProgress = true;
		var mode = gameMode(self.x, self.o);
		if (mode === "pvc" || mode === "cvc") {
			var loop = setInterval(function() {
				self.loop = loop;
				if (!self.myTurn()) {
					var move = self.computerMove();
					var $tile = $("#" + getNumber(move, false));
					$tile.find('img').attr('src', "images/" + self.turn + ".gif");
					self.boardArray[move] = self.turn;
					result = self.winner();
					if (result !== "NO ONE") {
						self.endGame(result);
					}
					self.opponent();
				}
			}, 1000);
		} else {
			self.loop = -1;
		}
	};

	this.gameLoop = function() {
  	var self = this;
		$('#game-table table td').on('click', function() {
			var move;
			var $tile = $(this);				
			move = getNumber($tile.attr('id'), true);
			var result;
			if (self.myTurn() && self.inProgress) {
				if (self.isLegal(move)) {	
					$tile.find('img').attr('src', "images/" + self.turn + ".gif");
					self.boardArray[move] = self.turn;
					result = self.winner();
					if (result !== "NO ONE") {
						self.endGame(result);
					}
					self.opponent();
				}
			}
		});
	};

	this.changeOPlayer = function() {
		var self = this;
		$('#game-options #o-form input').on('click', function() {
			var $input = $(this);
			if (($input).attr('id') === "o-player") {
				self.o = "player";
			} else {
				self.o = "computer";
				if (self.loop !== -1) {
					clearInterval(self.loop);
				}
				if (self.inProgress) {
					self.computerLoop();
				}
			}
		});
	};

	this.changeXPlayer = function() {
		var self = this;
		$('#game-options #x-form input').on('click', function() {
			var $input = $(this);
			if (($input).attr('id') === "x-player") {
				self.x = "player";
			} else {
				self.x = "computer";
				if (self.loop !== -1) {
					clearInterval(self.loop);
				}
				if (self.inProgress) {
					self.computerLoop();
				}
			}
		});

	};

	this.changeBeginner = function() {
		var self = this;
		$('#game-options #begins-form input').on('click', function() {
			var $input = $(this);
			if (($input).attr('id') === "x-begins") {
				self.xBegins = true;
			} else {
				self.xBegins = false;
			}
			$('#new-game').trigger('click');
		});
	};

	this.myTurn = function() {
		if (this.turn === "x") {
			return this.x === "player";
		} else {
			return this.o === "player";
		}
	}

	this.isLegal = function(move) {
		return this.boardArray[move] === "";
	};

	this.humanMove = function() {

	};

	this.computerMove = function() {
		// If the computer can win on next move then make that move
  var self = this;
	var move = 0;
  var result = "";
  while (result !== "WON" && move < self.boardArray.length) {
    if (self.isLegal(move)) {
      self.boardArray[move] = self.turn;
      result = self.winner();
      self.boardArray[move] = "";
    }
    if (result !== "WON") {
      move++;
    }
  }

  // Otherwise, if human can win on the next move then make that move
  if (result !== "WON") {
    move = 0;
    while (result !== "WON" && move < self.boardArray.length) {
      if (self.isLegal(move)) {
				self.boardArray[move] = otherPlayer(self.turn);
        result = self.winner();
        self.boardArray[move] = "";
      }
      if (result !== "WON") {
        move++;
      }
    }
  }
  
  // Else, move to the best open square
  if (result !== "WON") {
    move = 0;
    var i = 0;
    var bestMoves = [4,0,2,6,8,1,3,5,7];
    //PICK BEST OPEN SQUARE
    while (result !== "WON" && i < self.boardArray.length) {
      move = bestMoves[i];
      if (self.isLegal(move)) {
        result = "WON";
      }
      i++;
    }
  }
  return move;

	};

	this.winner = function() {
		self = this;
  	for (var row = 0; row < 8; row++) {
    	if ((self.boardArray[self.winningRows[row][0]] !== "") &&
       (self.boardArray[self.winningRows[row][0]] === self.boardArray[self.winningRows[row][1]]) &&
       (self.boardArray[self.winningRows[row][1]] === self.boardArray[self.winningRows[row][2]])) {
      	return "WON";
    	}
  	}
  	function isTie(element) {
    	return element !== "";
  	}
  	if (self.boardArray.every(isTie)) {
    	return "TIE";
  	} else {
    	return "NO ONE";
  	}
	};

	this.endGame = function(result) {
		var self = this;
		self.inProgress = false;
		var $dialog = $('#dialog');
		$dialog.dialog('option', 'title', 'GAME OVER');
		if (result === "WON") {
			$dialog.find('p').text( "" + self.turn.toUpperCase() + " has won!");
		} else if (result === "TIE") {
			$dialog.find('p').text("It is a Tie!");
		}
		if (self.loop !== -1) {
			clearInterval(self.loop);
		}
		$dialog.dialog('open');
	};

	this.newGame = function() {
		var self = this;
		$('#new-game').on('click', function() {
			if (self.xBegins) {
				self.turn = "x";
			} else {
				self.turn = "o";
			}

			$tile = $('.tile');
			var count = 0;
			$tile.each(function() {
				$tile.find('img').attr('src', "images/blankSquare.gif");
				self.boardArray[count] = "";
				count++;
			});
			if (self.loop !== -1) {
				clearInterval(self.loop);
			}
			self.computerLoop();
		});
	};

	this.help = function() {
		var self = this;
		var $dialog = $('#dialog');
		$('#help-button').on('click', function() {
			$dialog.dialog('option', 'title', 'HELP');
			$dialog.find('p').text("You can play vs the computer or vs another player or if you want you can watch the computer play itself. You can change these options with the buttons above.");
			$dialog.dialog('open');
		});
	};

	var gameMode = function(x, o) {
		if (x === "player" && o === "player") {
			return "pvp";
		} else if ((x === "player" && o === "computer") || x === "computer" && o === "player") {
			return "pvc";
		} else if (x === "computer" && o === "computer") {
			return "cvc";
		}
	};

	var getNumber = function(input, toNumber) {
		if (toNumber === true) {
			if (input === "zero") {
				return 0;
			} else if (input === "one") {
				return 1;
			} else if (input === "two") {
				return 2;
			} else if (input === "three") {
				return 3;
			} else if (input === "four") {
				return 4;
			} else if (input === "five") {
				return 5;
			} else if (input === "six") {
				return 6;
			} else if (input === "seven") {
				return 7;
			} else if (input === "eight") {
				return 8;
			}
		} else {
			if (input === 0) {
				return "zero";
			} else if (input === 1) {
				return "one";
			} else if (input === 2) {
				return "two";
			} else if (input === 3) {
				return "three";
			} else if (input === 4) {
				return "four"; 
			} else if (input === 5) {
				return "five";
			} else if (input === 6) {
				return "six";
			} else if (input === 7) {
				return "seven";
			} else if (input === 8) {
				return "eight";
			}
		}
	};

	var otherPlayer = function(turn) {
		if (turn === "x") {
			return "o";
		} else {
			return "x";
		}
	};
}
