var gameData = {
	boardSize: 7,
	numShips: 3,
	shipLength: 3,
	shipsSunk: 0,
	ships: [
		{locations: [0, 0, 0], hits: [false, false, false]},
		{locations: [0, 0, 0], hits: [false, false, false]},
		{locations: [0, 0, 0], hits: [false, false, false]},
	],
	guesses: 0,

	generateShips: function() {
		var shipLocations;
		for (var i = 0; i < this.numShips; ++i) {
			do {
				shipLocations = this.generateShip();
			} while (this.checkShipCollision(shipLocations));
			this.ships[i].locations = shipLocations;
		}
	},

	generateShip: function() {
		var direction = Math.floor(Math.random() * 2);
		var startRow, startCol;
		if (direction == 0) {
			startRow = Math.floor(Math.random() * this.boardSize);
			startCol = Math.floor(Math.random()
				* (this.boardSize - this.shipLength + 1));
		}
		else {
			startRow = Math.floor(Math.random() 
				* (this.boardSize - this.shipLength + 1));
			startCol = Math.floor(Math.random() * this.boardSize);
		}
		var shipLocation = [];
		for (var i = 0; i < this.shipLength; ++i) {
			if (direction == 0) {
				shipLocation.push(startRow + "" + (startCol + i));
			}
			else {
				shipLocation.push((startRow + i) + "" + startCol);
			}
		}
		return shipLocation;
	},

	checkShipCollision: function(locations) {
		for (var i = 0; i < this.numShips; ++i) {
			if (this.ships[i].locations[0] === 0) {
				break;
			}
			var ship = this.ships[i];
			for (var j = 0; j < locations.length; ++j) {
				if (ship.locations.indexOf(locations[j]) >= 0) {
					return true;
				}
			}
		}
		return false;
	},

	checkShipSunk: function(ship) {
		for (var i = 0; i < this.shipLength; ++i) {
			if (!ship.hits[i]) {
				return false;
			}
		}
		return true;
	},

	fire: function(location) {
		for (var i = 0; i < this.numShips; ++i) {
			var ship = this.ships[i];
			var locIndex = ship.locations.indexOf(location);
			if (locIndex >= 0) {
				if (!ship.hits[locIndex]) {
					ship.hits[locIndex] = true;
					if (this.checkShipSunk(ship)) {
						++this.shipsSunk;
						if (this.shipsSunk == this.numShips) {
							showMessage("You sunk all my battleships in "
								+ this.guesses + " guesses.");
						}
						else {
							showMessage("You sunk my battleship!");
						}
					}
					else {
						showMessage("Hit");
					}
				}
				return true;
			}
		}
		showMessage("Miss");
		return false;
	},
};

function showMessage(message) {
	var messageArea = document.getElementById("messageArea");
	messageArea.innerHTML = message;
}

function cell_handle_click() {
	if (document.getElementById(this.id).getAttribute("class") !== null
	|| gameData.shipsSunk == gameData.numShips) {
		return;
	}
	++gameData.guesses;
	if (gameData.fire(this.id)) {
		this.setAttribute("class", "hit");
	}
	else {
		this.setAttribute("class", "miss");
	}
}

function init_game() {
	for (var i = 0; i < gameData.boardSize; ++i) {
		for (var j = 0; j < gameData.boardSize; ++j) {
			var cell_id = i + "" + j;
			var cell = document.getElementById(cell_id);
			cell.onclick = cell_handle_click;
		}
	}
	gameData.generateShips();
}

window.onload = init_game;
