/*
 * classList.js: Cross-browser full element.classList implementation.
 * 2012-11-15
 *
 * By Eli Grey, http://eligrey.com
 * Public Domain.
 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
 */

/*global self, document, DOMException */

/*! @source http://purl.eligrey.com/github/classList.js/blob/master/classList.js*/

if (typeof document !== "undefined" && !("classList" in document.createElement("a"))) {

(function (view) {

"use strict";

if (!('HTMLElement' in view) && !('Element' in view)) return;

var
	  classListProp = "classList"
	, protoProp = "prototype"
	, elemCtrProto = (view.HTMLElement || view.Element)[protoProp]
	, objCtr = Object
	, strTrim = String[protoProp].trim || function () {
		return this.replace(/^\s+|\s+$/g, "");
	}
	, arrIndexOf = Array[protoProp].indexOf || function (item) {
		var
			  i = 0
			, len = this.length
		;
		for (; i < len; i++) {
			if (i in this && this[i] === item) {
				return i;
			}
		}
		return -1;
	}
	// Vendors: please allow content code to instantiate DOMExceptions
	, DOMEx = function (type, message) {
		this.name = type;
		this.code = DOMException[type];
		this.message = message;
	}
	, checkTokenAndGetIndex = function (classList, token) {
		if (token === "") {
			throw new DOMEx(
				  "SYNTAX_ERR"
				, "An invalid or illegal string was specified"
			);
		}
		if (/\s/.test(token)) {
			throw new DOMEx(
				  "INVALID_CHARACTER_ERR"
				, "String contains an invalid character"
			);
		}
		return arrIndexOf.call(classList, token);
	}
	, ClassList = function (elem) {
		var
			  trimmedClasses = strTrim.call(elem.className)
			, classes = trimmedClasses ? trimmedClasses.split(/\s+/) : []
			, i = 0
			, len = classes.length
		;
		for (; i < len; i++) {
			this.push(classes[i]);
		}
		this._updateClassName = function () {
			elem.className = this.toString();
		};
	}
	, classListProto = ClassList[protoProp] = []
	, classListGetter = function () {
		return new ClassList(this);
	}
;
// Most DOMException implementations don't allow calling DOMException's toString()
// on non-DOMExceptions. Error's toString() is sufficient here.
DOMEx[protoProp] = Error[protoProp];
classListProto.item = function (i) {
	return this[i] || null;
};
classListProto.contains = function (token) {
	token += "";
	return checkTokenAndGetIndex(this, token) !== -1;
};
classListProto.add = function () {
	var
		  tokens = arguments
		, i = 0
		, l = tokens.length
		, token
		, updated = false
	;
	do {
		token = tokens[i] + "";
		if (checkTokenAndGetIndex(this, token) === -1) {
			this.push(token);
			updated = true;
		}
	}
	while (++i < l);

	if (updated) {
		this._updateClassName();
	}
};
classListProto.remove = function () {
	var
		  tokens = arguments
		, i = 0
		, l = tokens.length
		, token
		, updated = false
	;
	do {
		token = tokens[i] + "";
		var index = checkTokenAndGetIndex(this, token);
		if (index !== -1) {
			this.splice(index, 1);
			updated = true;
		}
	}
	while (++i < l);

	if (updated) {
		this._updateClassName();
	}
};
classListProto.toggle = function (token, forse) {
	token += "";

	var
		  result = this.contains(token)
		, method = result ?
			forse !== true && "remove"
		:
			forse !== false && "add"
	;

	if (method) {
		this[method](token);
	}

	return !result;
};
classListProto.toString = function () {
	return this.join(" ");
};

if (objCtr.defineProperty) {
	var classListPropDesc = {
		  get: classListGetter
		, enumerable: true
		, configurable: true
	};
	try {
		objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
	} catch (ex) { // IE 8 doesn't support enumerable:true
		if (ex.number === -0x7FF5EC54) {
			classListPropDesc.enumerable = false;
			objCtr.defineProperty(elemCtrProto, classListProp, classListPropDesc);
		}
	}
} else if (objCtr[protoProp].__defineGetter__) {
	elemCtrProto.__defineGetter__(classListProp, classListGetter);
}

}(self));

}


/*
 * SLYD: a sliding puzzle game by Ned Kahvo
 */
(function(slyd) {

	slyd.util = (function(){
		this.convertDatasetKey = function(key) {
			var keyParts = key.split(/(?=[A-Z])/);
			return ("data-" + keyParts.join("-")).toLowerCase();
		};
		this.getDataset = function(element, key) {
			if (!("dataset" in element)) {
				return element.getAttribute(slyd.util.convertDatasetKey(key));
			}
			return element.dataset[key];
		};
		this.setDataset = function(element, key, value) {
			if (!("dataset" in element)) {
				element.setAttribute(slyd.util.convertDatasetKey(key), value);
			} else {
				element.dataset[key] = value;
			}
		};
		this.getScale = function(viewport, object) {
			// will fill the viewport with the object, preserving the aspect ratio
			var scale = viewport.width / object.width;		// stretch or compress the object to fit the viewport width
			if (scale * object.height < viewport.height) {
				scale = viewport.height / object.height;	// stretch or compress the object to fit the viewport height
			}
			return scale;
		};
		this.getImageData = function(path, width, height, handleImageData) {
			var img = new Image();
			var onImageLoad = function() {
				var imageWidth = this.width,
					imageHeight = this.height;
				var viewport = {
					width: width,
					height: height
				};
				var object = {
					width: imageWidth,
					height: imageHeight
				};

				// stretch or compress the image and center within the viewport
				var scale = slyd.util.getScale(viewport, object),
					sW = Math.ceil( imageWidth * scale ),
					sH = Math.ceil( imageHeight * scale ),
					sX = Math.floor( (width - sW)/2 ),
					sY = Math.floor( (height - sH)/2 );

				var cvs = document.createElement("canvas");
				cvs.width = width;
				cvs.height = height;

				var ctx = cvs.getContext("2d");
				ctx.drawImage(img, sX, sY, sW, sH);

				var imageData = ctx.getImageData(0, 0, width, height);
				handleImageData(imageData, cvs.toDataURL());
			};
			img.onload = onImageLoad;
			img.src = path;
		};
		return this;
	})();

	slyd.Timer = function(element) {
		var _startTime, _endTime, _intervalId,
			_displayInterval = 1000,
			_timerElement = element;
		var sec = 1000,
			min = 60 * sec;

		var getTimestamp = function() {
			return new Date().getTime();
		};
		var updateTime = function(timestamp) {
			_timerElement && (_timerElement.innerHTML = this.formatTime(timestamp - _startTime));
		};
		var zeroPad = function(number) {
			return number < 10 ? "0"+number : number;
		};
		this.formatTime = function(timeDiff) {
			var minutes = Math.floor(timeDiff / min);
			timeDiff = timeDiff % min;
			var seconds = Math.floor(timeDiff / sec);

			return zeroPad(minutes) + ":" +zeroPad(seconds);
		};
		this.start = function() {
			_startTime = getTimestamp();
			var _this = this;
			updateTime.apply(_this, [getTimestamp()]);
			_intervalId = window.setInterval(function() {
				updateTime.apply(_this, [getTimestamp()]);
			}, _displayInterval);
		};
		this.stop = function() {
			var _this = this;
			window.clearInterval(_intervalId);
			_endTime = getTimestamp();
			updateTime.apply(_this, [_endTime]);
			return _endTime - _startTime;
		};
		return this;
	};

	slyd.Model = function(cols, rows, sortedTiles, swapCheckFunction) {
		var _tilesX = cols,
			_tilesY = rows,
			_sortedTiles = sortedTiles,
			_canSwap = swapCheckFunction,
			_shuffledTiles = [],
			_lastMovedElements = [];

		var swapTiles = function(tiles, indexA, indexB) {
			if (!_canSwap(tiles[indexA], tiles[indexB])) {
				// not a valid position, can't swap tiles
				return false;
			}

			var temp = tiles[indexA];
			tiles[indexA] = tiles[indexB];
			tiles[indexB] = temp;
			_lastMovedElements = [tiles[indexA], tiles[indexB]];
			return true;
		};

		var getTileIndex = function(tile) {
			var index = _shuffledTiles.indexOf(tile);
			return index;
		};

		this.shuffleTiles = function() {
			_shuffledTiles = _sortedTiles.slice(0);
			var tile = _shuffledTiles[_shuffledTiles.length-1];
			var directions = [[1,0],[-1,0],[0,1],[0,-1]];
			var direction;
			var count = _tilesX*_tilesY*directions.length*10;
			while (--count) {
				do {
					direction = directions[Math.floor(Math.random() * directions.length)];
				} while( !this.moveTile(tile, direction) );
			}
			return _shuffledTiles;
		};

		this.isGameOver = function() {
			for (var i=0, len=_shuffledTiles.length; i<len; i++) {
				if ( getTileIndex(_shuffledTiles[i]) != getTileIndex(_sortedTiles[i]) ) {
					return false;
				}
			}
			return true;
		};

		this.getLastMovedElements = function() {
			return _lastMovedElements;
		};

		this.moveTile = function(tile, direction) {
			var index = getTileIndex(tile);
			if (direction[0] > 0) {
				// move right
				if (index % _tilesX != _tilesX - 1) {
					return swapTiles(_shuffledTiles, index, index + 1);
				}
				return false;
			}
			if (direction[0] < 0) {
				// move left
				if (index % _tilesX != 0) {
					return swapTiles(_shuffledTiles, index, index - 1);
				}
				return false;
			}
			if (direction[1] > 0) {
				// move up
				if (index - _tilesX >= 0) {
					return swapTiles(_shuffledTiles, index, index - _tilesX);
				}
				return false;
			}
			if (direction[1] < 0) {
				// move down
				if (index + _tilesX < _tilesX * _tilesY) {
					return swapTiles(_shuffledTiles, index, index + _tilesX);
				}
				return false;
			}
			return false;
		};
		
		return this;
	};

	slyd.View = function(slydController, containerElement, cols, rows) {
		var _container = containerElement,
			_cols = cols,
			_rows = rows;

		var _board = document.createElement("div");
		_board.style.width = "100%";
		_board.style.height = "100%";
		_container.appendChild(_board);
		// TODO: scale the game to fit different sized screens

		var _tileElements = [];
		var _selected = {};
		var _hintImageDataURL = "";

		var handleStart = function(event) {
			event.preventDefault();
			_selected.element = event.target;
			_selected.tileIndex = slyd.util.getDataset(_selected.element, "number");
			_selected.touchStart = {
				x: event.touches[0].clientX,
				y: event.touches[0].clientY
			};
			_selected.moveThreshold = {
				x: Math.floor( parseInt(_selected.element.style.width, 10) * 0.5 ),
				y: Math.floor( parseInt(_selected.element.style.height, 10) * 0.5 )
			};
			_selected.ready = true;
		};
		var checkWin = function() {
			if (slydController.isGameOver()) {
				_board.getElementsByClassName("hide")[0].classList.remove("hide");
			}
		};
		var endMove = function() {
			_selected = {};
		};
		var handleMove = function(event) {
			if (!_selected.ready) return;
			event.preventDefault();
			_selected.touchDelta = {
				x: event.touches[0].clientX - _selected.touchStart.x,
				y: event.touches[0].clientY - _selected.touchStart.y
			};
			if (_selected.touchDelta.x < 0 && -1*_selected.touchDelta.x > _selected.moveThreshold.x) {
				// move left
				slydController.moveTile(_selected.element, [-1, 0]) && swapTiles(slydController.getLastMovedElements());
				endMove();
				return;
			}
			if (_selected.touchDelta.x > 0 && _selected.touchDelta.x > _selected.moveThreshold.x) {
				// move right
				slydController.moveTile(_selected.element, [1, 0]) && swapTiles(slydController.getLastMovedElements());
				endMove();
				return;
			}
			if (_selected.touchDelta.y < 0 && -1*_selected.touchDelta.y > _selected.moveThreshold.y) {
				// move up
				slydController.moveTile(_selected.element, [0, 1]) && swapTiles(slydController.getLastMovedElements());
				endMove();
				return;
			}
			if (_selected.touchDelta.y > 0 && _selected.touchDelta.y > _selected.moveThreshold.y) {
				// move down
				slydController.moveTile(_selected.element, [0, -1]) && swapTiles(slydController.getLastMovedElements());
				endMove();
				return;
			}
		};
		var handleEnd = function(event) {
			event.preventDefault();
			endMove();
		};
		var handleTransitionEnd = function(event) {
			event.stopPropagation();
			event.preventDefault();
			checkWin();
		};

		var swapTiles = function(elements) {
			var temp = {
				top: elements[0].style.top,
				left: elements[0].style.left
			};
			elements[0].style.top = elements[1].style.top;
			elements[0].style.left = elements[1].style.left;
			elements[1].style.top = temp.top;
			elements[1].style.left = temp.left;
		};

		this.getWidth = function() {
			return _container.clientWidth;
		};

		this.getHeight = function() {
			return _container.clientHeight;
		};

		this.getTileWidth = function() {
			return Math.floor(this.getWidth() / _cols);
		};

		this.getTileHeight = function() {
			return Math.floor(this.getHeight() / _rows);
		};

		this.generateTileElements = function(tileImages, tileWidth, tileHeight) {
			var tile;
			for (var i=0, len=tileImages.length; i<len; i++) {
				tile = document.createElement("div");
				tile.style.backgroundImage = "url(" + tileImages[i] + ")";
				tile.style.width = tileWidth + "px";
				tile.style.height = tileHeight + "px";
				tile.classList.add("tile");
				slyd.util.setDataset(tile, "number", i);
				_tileElements.push(tile);
			}
			_tileElements[_tileElements.length-1].classList.add("hide");
			return _tileElements;
		};

		this.drawTiles = function(tileElements, cols, rows) {
			var tile, tileHeight, tileWidth, col, row,
				parentElementRect = _board.getBoundingClientRect();
			for (var i=0, len=tileElements.length; i<len; i++) {
				tile = tileElements[i];
				tileHeight = parseInt(tile.style.height, 10);
				tileWidth = parseInt(tile.style.width, 10);
				row = Math.floor(i / cols);
				col = i % cols;
				tile.style.position = "absolute";
				tile.style.top = row * tileHeight + parentElementRect.top + "px";
				tile.style.left = col * tileWidth + parentElementRect.left + "px";
				_board.appendChild(tileElements[i]);
			}
		};

		this.setHintImage = function(hintImageDataURL) {
			_hintImageDataURL = hintImageDataURL;
		};

		this.toggleHint = function() {
			if (!_hintImageDataURL) { return; }
			_container.classList.toggle("showHint");
			_container.style.backgroundImage = _container.classList.contains("showHint") ? "url("+_hintImageDataURL+")" : "";
		};

		this.attachEvents = function() {
			for(var i=0, len=_tileElements.length; i<len; i++) {
				var tile = _tileElements[i];
				tile.addEventListener("touchstart", handleStart, false);
				tile.addEventListener("touchmove", handleMove, false);
				tile.addEventListener("touchend", handleEnd, false);
				tile.addEventListener("touchleave", handleEnd, false);
				
				if (tile.classList.contains("hide")) {
					tile.addEventListener("webkitTransitionEnd", handleTransitionEnd, false);
				}
			}
		};

		// resize container to handle size differences due to rounding
		_container.style.width = this.getTileWidth() * _cols + "px";
		_container.style.height = this.getTileHeight() * _rows + "px";

		return this;
	};

	slyd.Controller = function(parameters) {
		var _slydModel;
		var _slydView;
		var _slydController = {};
		var _slydTimer = slyd.Timer(parameters.timer);

		_slydController.moveTile = function(element, direction) {
			return _slydModel.moveTile(element, direction);
		};

		_slydController.getLastMovedElements = function() {
			return _slydModel.getLastMovedElements();
		};

		_slydController.isGameOver = function() {
			if (_slydModel.isGameOver()) {
				var time = _slydTimer.stop();
				window.setTimeout(function(){
					parameters.onWin(_slydTimer.formatTime(time));
				}, 10);
				return true;
			}
			return false;
		};

		var makeTilesFromImageData = function(imageData, tileWidth, tileHeight, cols, rows) {
			var cvs = document.createElement("canvas");
			cvs.width = tileWidth;
			cvs.height = tileHeight;
			var ctx = cvs.getContext("2d");
			var tiles = [];
			for (var y=0; y<rows; y++) {
				for (var x=0; x<cols; x++) {
					var drawX = -1*x*tileWidth;
					var drawY = -1*y*tileHeight;
					ctx.putImageData(imageData, drawX, drawY);
					tiles.push( cvs.toDataURL() );
				}
			}
			return tiles;
		};

		this.play = function(image, difficulty) {
			var difficulties = [
				{cols: 3, rows: 3},
				{cols: 4, rows: 4},
				{cols: 5, rows: 5}
			];

			var cols = difficulties[difficulty].cols,
				rows = difficulties[difficulty].rows;

			_slydView = slyd.View(_slydController, parameters.container, cols, rows);

			var width = _slydView.getWidth(),
				height = _slydView.getHeight(),
				tileWidth = _slydView.getTileWidth(),
				tileHeight = _slydView.getTileHeight();

			slyd.util.getImageData(image, width, height, function(imageData, imageDataURL) {
				_slydView.setHintImage(imageDataURL);
				var tiles = makeTilesFromImageData(imageData, tileWidth, tileHeight, cols, rows);

				var sortedTileElements = _slydView.generateTileElements(tiles, tileWidth, tileHeight);

				_slydModel = slyd.Model(cols, rows, sortedTileElements, function(tileA, tileB){
					return ( tileA.classList.contains("hide") || tileB.classList.contains("hide") );
				});

				var randomTileElements = _slydModel.shuffleTiles();

				_slydView.drawTiles(randomTileElements, cols, rows);
				_slydView.attachEvents(randomTileElements, _slydController);

				_slydTimer.start();
			});
		};

		this.toggleHint = function() {
			_slydView && _slydView.toggleHint();
		};

		return this;
	};

	slyd.setup = function(parameters) {
		return slyd.Controller(parameters);
	};

})(window.slyd = window.slyd || {});


/*
 * Leaderboard by Ned Kahvo
 * uses localStorage to store your top game scores
 */
(function(leaderboard) {
	leaderboard.create = function(game, sortFunction) {
		var _game = game,
			_sortFunction = sortFunction || function(){return 0;},
			_leaders = [],
			_public = {};

		try {
			var storedLeaders = JSON.parse( localStorage.getItem(_game) );
			if (storedLeaders) {
				_leaders = storedLeaders;
			}
		} catch(exception) { console.log(exception); }

		_public.list = function(number) {
			var count = _leaders.length;
			if (number && number > 0 && number < count) {
				count = number;
			}
			return _leaders.slice(0, count);
		};

		_public.add = function(score, player) {
			var record = {
				"score": score,
				"player": player
			};
			_leaders.push(record);
			_leaders.sort(_sortFunction);
			localStorage.setItem(_game, JSON.stringify(_leaders));
			return _leaders.indexOf(record) + 1;
		};

		return _public;
	};
})(window.leaderboard = window.leaderboard || {});


var showLeaders = function(leaders) {
	var leaderBoard = document.getElementById("leaders");
	leaderBoard.innerHTML = "";
	var leader;
	for (var i=0, len=leaders.length; i<len; i++) {
		leader = document.createElement("li");
		leader.innerHTML = [leaders[i].score, leaders[i].player].join(" ");
		leaderBoard.appendChild(leader);
	}
};

var slydLeaders = leaderboard.create("slyd", function(leaderA, leaderB) {
	return leaderA.score < leaderB.score ? -1 : 1;
});
var leaders = slydLeaders.list(5);
if (leaders.length > 0) {
	showLeaders(leaders);
}

var slydGame = slyd.setup({
	container: document.getElementById("container"),
	timer: document.getElementById("timer"),
	onWin: function(time) {
		var rank = slydLeaders.add(time, "");
		alert("You win!!\nYou rock!\n\nTime: "+time+"\nRanking: "+rank);
		showLeaders(slydLeaders.list(5));
	}
});

var levels = ["images/darth-vader.jpg", "images/eiffel-tower.jpg"];
slydGame.play(levels[0], 0);

document.getElementById("toggle_hint").addEventListener("click", function(event) {
	event.preventDefault();
	slydGame.toggleHint();
}, false);