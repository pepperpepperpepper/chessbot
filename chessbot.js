// ==UserScript==
// @name         chessbot
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://en.lichess.org/*
// @grant        none
// ==/UserScript==
//cinnamonCommand = Module.cwrap('command', 'string', ['string','string']);
Globals = {};

SVG_STR = "<svg><defs><marker id=\"arrowhead-g\" orient=\"auto\" markerWidth=\"4\" markerHeight=\"8\" refX=\"2.05\" refY=\"2.01\"><path id=\"triangle-g\" d=\"M0,0 V4 L3,2 Z\" fill=\"#15781B\"></path></marker></defs><line id=\"line-g\" stroke=\"#15781B\" stroke-width=\"10\" stroke-linecap=\"round\" marker-end=\"url(#arrowhead-g)\" opacity=\"1\" x1=\"{0}\" y1=\"{1}\" x2=\"{2}\" y2=\"{3}\"></line></svg>";



//TO DO

//save time delta...make bot move at same time as opponent +/- a random interval
//var min, sec = $("div.clock_black").find("div.time").html().split(/<.*>/g)
//clock_white



//make random move (not mistake necessarily, just random move)
//var valid_moves = chess.moves()
//var random_end_pos = valid_moves[Math.floor(Math.random() * valid_moves.length)]
//var move_update = chess.move(random_end_pos)
//var random_move = move_update.from + move_update.to
//executeMove(random_move) //no need to change the update fen string logic, class prevents double updates


function init() {
    Globals.chessboard = $("div.cg-board")[0];
    Globals.boardPosition = Globals.chessboard.getBoundingClientRect();

    Globals.chess = new Chess();
	Globals.isWhite = document.querySelector('div.cg-board').firstElementChild.className.match(/black/) !== null;
    Globals.lastNodeAdded = [];
    $("div.moves").bind("DOMSubtreeModified", checkMoves);
    
    // configuration of the observer:
    var config = { attributes: true, childList: true, characterData: true };
    // pass in the target node, as well as the observer options
    var moves = getMoves();
    Globals.numMoves =  moves.length - 1;
    //var target = document.querySelector('div.cg-board'); //try it? yep
    //observer.observe(target, config); 
    checkMoves();
    if (moves.length){
        moves.each(function(i, move) {
	    	Globals.chess.move(move.innerHTML);
    	});
    }
    speak("got sum bad news");
    speak("I'm a COP");
}


window.getMoves = function() {
	return $("div.moves").find("move").not(".empty");
};

function getMoveFromCinnamon(){
	cinnamonCommand("setMaxTimeMillsec", 1000);
	cinnamonCommand("position", Globals.chess.fen());
	moveFromCinnamon = cinnamonCommand("go","");
	console.log("Move from Cinnamon Engine: " + moveFromCinnamon);
    return moveFromCinnamon;
}



function getTile(pos) {
	file = pos[0].charCodeAt(0) - 'a'.charCodeAt(0);
	rank = parseInt(pos[1]) - 1;
	if (!Globals.isWhite) {
		file = 7 - file;
		rank = rank;
	} else {
		file = file;
		rank = 7 - rank;
	}
	return [rank, file];
}


function clickBoard(posX, posY){
	var clickEvent= document.createEvent('MouseEvents');
	clickEvent.initMouseEvent(
		'mousedown', true, true, window, 0,
		0, 0, posX, posY, false, false,
		false, false, 0, null
	);
	Globals.chessboard.dispatchEvent(clickEvent);
}



function showMoveSVG(moveString){
  pos = moveStringToCoords(moveString);
  //remove old svg
	$(Globals.chessboard).find("svg").remove();
	// add new svg
	var inner = SVG_STR;
	inner = inner.replace("{0}", pos.start[0]);
	inner = inner.replace("{1}", pos.start[1]);
	inner = inner.replace("{2}", pos.end[0]);
	inner = inner.replace("{3}", pos.end[1]);
	$(Globals.chessboard).append(inner);
}


window.executeMove = function(moveString){
  console.log("executing", moveString);
  var pos = moveStringToCoords(moveString);
  var MaxTime = window.blitz ? 3500 : 4000;
  var MinTime = window.blitz ? 900 : 1200;
  var delay = window.immediate? 0.8 : Math.floor(Math.random() * MaxTime) + MinTime;
  var t = setTimeout(function(){
    clickBoard(pos.start[0] + Globals.boardPosition.left, pos.start[1] + Globals.boardPosition.top);
    clickBoard(pos.end[0] + Globals.boardPosition.left, pos.end[1] + Globals.boardPosition.top);
  }, delay);
    //so executemove is not immediate too? and MaxTime is more than 300
};

function moveStringToCoords(moveString){
  translate = function(coord){
    return 64 * coord + 32;
  };
  return {
    "start": getTile(moveString.substring(0, 2)).map(translate).reverse(),
    "end": getTile(moveString.substring(2, 4)).map(translate).reverse()
  };
}

window.cycleSVGColors = function(color){
    $(Globals.chessboard).find("svg").find("line")[0].style.stroke = color;
    $(Globals.chessboard).find("svg").find("path")[0].style.fill = color;
};


function speak(phrase){
  var delay = Math.floor(Math.random() * 20000);
  var t = setTimeout(function(){
      lichess.pubsub.emit('socket.send')('talk', phrase);
  }, delay);
}

window.promote = function(target){
  console.log("calling promote");
  var promotionTarget;
  switch(target) {
    case "r":
        promotionTarget = "piece.rook";
        break;
    case "b":
        promotionTarget = "piece.bishop";
        break;
    case "q":
        promotionTarget = "piece.queen";
        break;
    case "k":
        promotionTarget = "piece.knight";
        break;
    default:
        promotionTarget = "piece.queen";
  }
  var promotionEl = $("#promotion_choice").find(promotionTarget)[0];
  var t = setTimeout(function(){
  var promotionElRect = promotionEl.getBoundingClientRect(); //here, I guess it changes though, the coords somehow change i guess it does promoton before selection actually appears on screen, need to put a wait
    //yeah I have that, it doesn't sleep though for whatever reason, ignores it
  var clickEvent = document.createEvent('MouseEvents');
  clickEvent.initMouseEvent(
    'click', true, true, window, 0,
    0, 0,
    promotionElRect.left + 32,
    promotionElRect.top + 32,
    false, false,
    false, false, 0, null
  );
  console.log("clicking now");
  console.log((promotionElRect.left + 32), (promotionElRect.top + 32));
  console.log(promotionElRect.left, promotionElRect.top);

  promotionEl.dispatchEvent(clickEvent);
  window.promotionSequence = false;
  }, 2000);
    
};
window.promotionSequence = false;



//look good?

function onMove(moves) {
	turn = moves.length % 2;
	opponentMoved = (turn === 0 && Globals.isWhite) || (turn === 1 && !Globals.isWhite);
	lastMove = moves[moves.length-1];    
    //update fen string
    //this makes a properly formatted game string to send to the chess engine
    if (lastMove){
      Globals.chess.move(lastMove.innerHTML);
    }
	if (opponentMoved) {
        var moveFromCinnamon = getMoveFromCinnamon();
		showMoveSVG(moveFromCinnamon);
        if (moveFromCinnamon.length == 5 && (['r', 'b', 'q', 'k'].indexOf(moveFromCinnamon.charAt(4)) != -1)){
          window.promotionSequence = true;
          console.log("setting promotion sequence")
        }
        executeMove(moveFromCinnamon);
        if (window.promotionSequence){
          var t = setInterval(
            function(){
              console.log("in sleep");
              if ($("#promotion_choice").find("piece.queen").length){
                promote(moveFromCinnamon.charAt(4));
                window.clearInterval(t);
              }
            }, 100);
        }
	}
}

function checkMoves() {
    if (window.promotionSequence){
        return;
    }
	moves = getMoves(); // b 1          w 0 1
    while (Globals.numMoves < moves.length) {
		Globals.numMoves++;
		onMove(moves.slice(0, Globals.numMoves));
	}
}

$(document).ready(init);