// ==UserScript==
// @name         Color Animation
// @namespace    https://en.lichess.org/*
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://en.lichess.org/*
// @grant        none
// ==/UserScript==

window.colorAnimation = undefined;

function loop() {
    var fillColors = [
      "#00FFFF",
      "#FFFF00",
      "#FF0000",
      "#0033FF",
      "#FF6600",
    ];
    var fillColor = fillColors[Math.floor(Math.random() * fillColors.length)];
    window.changeSVGColors(fillColor);
    var t = setTimeout(function(){
      window.colorAnimation = window.requestAnimationFrame(loop);
    }, 100);
}


window.changeSVGColors = function(color){
    $(Globals.chessboard).find("svg").find("line")[0].style.stroke = color;
    $(Globals.chessboard).find("svg").find("path")[0].style.fill = color;
};


window.startColorAnimation = function() {
    if (!window.colorAnimation) {
       loop();
    }
};

window.stopColorAnimation = function() {
    if (window.colorAnimation) {
       window.cancelAnimationFrame(window.colorAnimation);
       window.colorAnimation = undefined;
    }
};