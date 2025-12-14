const cardPixelsWidth = 71;
const cardPixelsHeight = 96;
const cardLeftPadding = 9;
const cardTopPadding = 9;
const cardWidth = cardPixelsWidth + cardLeftPadding;
const cardHeight = cardPixelsHeight + cardTopPadding;
const cardProps = { width: cardWidth, height: cardHeight };
var playAreaWidth = document.getElementById("intro").offsetWidth;
var lastDraggedCard;
var cards;
var histStore;
var cardIdxs;

function HistoryData(moveIdx, coverIdx, coverCard) {
	this.moveIdx = moveIdx;
	this.coverIdx = coverIdx;
	this.coverCard = coverCard;
}

function getAllowedCols(cardProps) {
	return Math.min(13, Math.floor(playAreaWidth / cardProps.width));
}

function updatePositions(cards, cardProps) {
	const nCol = getAllowedCols(cardProps);
	var r = 0, c = 0;
	for (var i = 0; i < cards.length; ++i) {
		var card = cards[i];
		if (card === null) {
			continue;
		}
		var cardElem = document.getElementById(card);
		cardElem.src = "cards/" + card + ".gif";
		cardElem.style.left = c * cardProps.width + "px";
		cardElem.style.top = r * cardProps.height + "px";
		++c;
		if (c >= nCol) {
			++r;
			c = 0;
		}
	}
}

function checkValidMove(moveIdx, moveCard, coverIdx, coverCard) {
	if (coverIdx >= moveIdx) {
		return false;
	}
	// Count the number of cards in between moveIdx and coverIdx
	var nCards = 0;
	for (var i = moveIdx - 1; i > coverIdx; --i) {
		if (cards[i] !== null) {
			++nCards;
		}
	}
	if (nCards != 0 && nCards != 2) {
		return false;
	}
	var moveMatch = moveCard.match(/([a-z]+)([0-9]{1,2})/);
	var coverMatch = coverCard.match(/([a-z]+)([0-9]{1,2})/);
	var moveSuit = moveMatch[1], moveValue = Number(moveMatch[2]);
	var coverSuit = coverMatch[1], coverValue = Number(coverMatch[2]);
	if (moveSuit == coverSuit || moveValue == coverValue) {
		return true;
	}
	else {
		return false;
	}
}

function undo() {
	if (histStore.length > 0) {
		var histData = histStore.pop();
		var card = cards[histData.coverIdx];
		cards[histData.coverIdx] = histData.coverCard;
		cards[histData.moveIdx] = card;
		cardIdxs[histData.coverCard] = histData.coverIdx;
		cardIdxs[card] = histData.moveIdx;
		updatePositions(cards, cardProps);
	}
}

function newGame() {
	histStore = new Array();
	cards = new Array();
	var cardElems = document.getElementsByClassName("card");
	for (var i = 0; i < cardElems.length; ++i) {
		var card = cardElems[i].id;
		cards.push(card);
	}
	for (var i = cards.length - 1; i >= 0; --i) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = cards[i];
		cards[i] = cards[j];
		cards[j] = temp;
	}
	cardIdxs = new Map();
	for (var i = 0; i < cards.length; ++i) {
		cardIdxs[cards[i]] = i;
	}
	updatePositions(cards, cardProps);
}

function init() {
	newGame();
	for (var card of document.getElementsByClassName("card")) {
		card.style.position = "absolute";
		card.ondragover = function(event) {
			event.preventDefault();
		}
		card.ondragstart = function(event) {
			lastDraggedCard = event.target.id;
		}
		card.ondrop = function(event) {
			event.preventDefault();
			var moveCard = lastDraggedCard;
			var coverCard = event.target.id;
			var moveIdx = cardIdxs[moveCard];
			var coverIdx = cardIdxs[coverCard];
			if (checkValidMove(moveIdx, moveCard, coverIdx, coverCard)) {
				cards[moveIdx] = null;
				cards[coverIdx] = moveCard;
				cardIdxs[moveCard] = coverIdx;
				cardIdxs[coverCard] = -1;
				document.getElementById(coverCard).src = "";
				var histData = new HistoryData(moveIdx, coverIdx, coverCard);
				histStore.push(histData);
				updatePositions(cards, cardProps);
			}
		}
	}
	var newGameButton = document.getElementById("newGame");
	newGameButton.onclick = newGame;
	var undoButton = document.getElementById("undo");
	undoButton.onclick = undo;
}

function resizeHandler() {
	playAreaWidth = document.getElementById("intro").offsetWidth;
	updatePositions(cards, cardProps);
}

window.onresize = resizeHandler;
window.onload = init;
