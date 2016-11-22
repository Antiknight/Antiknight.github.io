<<<<<<< HEAD
"use strict";
var size = 3, stepTime = 10, rows, cols, state = [], grid = [], colors = [], canvas, ctx;
$(document).ready(function () {
    canvas = document.getElementById("myCanvas");
    canvas.width = $(window).width();
    canvas.height = $(window).height();
    cols = Math.floor($(window).width() / size);
    rows = Math.floor($(window).height() / size);
    ctx = canvas.getContext("2d");
    init();
});
function init() {
    randomizeGrid();
    iterate();
}
function randomizeGrid() {
    for (var i = 0; i < cols; i++) {
        grid[i] = [];
        state[i] = [];
        for (var j = 0; j < rows; j++) {
            grid[i][j] = Math.random() < 0.075;
            state[i][j] = grid[i][j];
        }
    }
}
function iterate() {
    updateGrid();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    state = grid;
    setTimeout(function () { iterate(); }, stepTime);
}
function drawGrid() {
    for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
            if (grid[i][j]) {
                drawCell(i, j);
            }
        }
    }
=======
function refreshData()
{
    x = 1;  // x = seconds
    var unix = (Math.round(+new Date()/1000))
 	//var d = new Date()
 	//var h = d.getHours();
 	//var m = d.getMinutes();
 	//var s = d.getSeconds();
 	
 	//if (h<=9) {h = '0'+h};
 	//if (m<=9) {m = '0'+m};
	//if (s<=9) {s = '0'+s};
	
 	//var	color = '#'+h+m+s;
 	var unixStr = unix.toString(16);
 	var unixPrint = unixStr.substring(4, 9);

 	var color = '#'+unixPrint.toString();
 	
    $("div.background").css("background-color", color );
    $("p#hex").text(color);
     
    setTimeout(refreshData, x*1000);
>>>>>>> parent of 904f910... substr
}
function updateGrid() {
    for (var i = 0; i < cols; i++) {
        for (var j = 0; j < rows; j++) {
            grid[i][j] = getNewState(i, j);
        }
    }
}
function getNewState(i, j) {
    var adyacentAlive = 0, iMinus = i - 1 >= 0, iPlus = i + 1 < cols, jMinus = j - 1 >= 0, jPlus = j + 1 < rows;
    if (iMinus && jMinus && state[i - 1][j - 1]) {
        adyacentAlive++;
    }
    ;
    if (iMinus && state[i - 1][j]) {
        adyacentAlive++;
    }
    ;
    if (iMinus && jPlus && state[i - 1][j + 1]) {
        adyacentAlive++;
    }
    ;
    if (iPlus && jMinus && state[i + 1][j - 1]) {
        adyacentAlive++;
    }
    ;
    if (iPlus && state[i + 1][j]) {
        adyacentAlive++;
    }
    ;
    if (iPlus && jPlus && state[i + 1][j + 1]) {
        adyacentAlive++;
    }
    ;
    if (jMinus && state[i][j - 1]) {
        adyacentAlive++;
    }
    ;
    if (jPlus && state[i][j + 1]) {
        adyacentAlive++;
    }
    ;
    return (state[i][j] && adyacentAlive === 2) || (state[i][j] && adyacentAlive === 3) || (!state[i][j] && adyacentAlive === 3);
}
function drawCell(x, y) {
    ctx.save();
    var unix = (Math.round(+new Date()/1000))
    var unixStr = unix.toString(16);
    var unixPrint = unixStr.substr(unixStr.length - 6);
    var color = '#'+unixPrint.toString();
    ctx.fillStyle = color;
    ctx.fillRect(x * size, y * size, size, size);
    ctx.restore();
}