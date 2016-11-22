(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';


/**
 * @param {Number} min inclusive
 * @param {Number} max exclusive
 * @return {Number}
 */
const randomInt = function(min,max){
  return Math.floor(min + Math.random() * (max - min));
};
/**
 * @param {Number} x row
 * @param {Number} y column
 * @return {Array}
 */
const neighborCells = function(x,y){
  return [[x,y-1],[x+1,y],[x,y+1],[x-1,y]];
};
/**
 * @param {Number} r row
 * @param {Number} c column
 * @param {Number} max
 * @param {Number} length
 * @return {Array}
 */
const pathTo = function(r,c,direction,length){
  return range(1,length+1).map((x) => range(0,x).reduce(([r,c]) => neighborCells(r,c)[direction],[r,c]));
};
/**
 * @param {Number} min
 * @param {Number} max
 * @return {Array}
 */
const range = function(min,max){
  return [...Array(max - min)].map((x,i) => min + i);
};

/**
 * @param {Number} rows number of rows in the grid (must be an odd integer)
 * @param {Number} cols number of columns in the grid (must be an integer)
 * @param {Boolean} returnGrid if true then it does not yield the grid
 */
const generator = function *(rows,cols,returnGrid){
  // creating the grid
  let grid = [];
  for(let r = 0; r < rows; r++){
    grid.push([]);
    for(let c = 0; c < cols; c++){
      grid[r][c] = 1;
    }
  }
  // sets the current position r, c and mark it as path
  let [ r,c ] = [rows,cols].map(x => randomInt(0,Math.floor(x/2))*2+1);
  yield [r,c]
  grid[r][c] = 0;

  let stack = [[r,c,range(0,4)]];

  let directions;
  let current;
  while(current = stack.pop()){
  let [ r, c, directions ] = current;

    while(directions.length > 0){
      var direction = directions[randomInt(0,directions.length)];

      // removes the current direction we are testing
      directions.splice(directions.indexOf(direction),1);

      var path = pathTo(r,c,direction,2);
      // checks if the path is in the grid
      let isInGrid = [rows,cols].every((x,i) => path[1][i] >= 0 && path[1][i] < x);

      if(isInGrid){
        // checks is the path contains only walls
        var containsOnlyWalls = path.every(([r,c]) => grid[r][c]);
        if(containsOnlyWalls){
          break
        }
      }
    }
    if(!containsOnlyWalls) continue

    // sets the cells to path
    for(let [ r, c ] of path){
         grid[r][c] = 0;
         yield [r,c]
    }

    // sets the new current cell and adds it to the stack
    if(directions.length != 0) stack.push([r,c,directions]);
    stack.push(path[1].concat([range(0,4)]));
  }

  if(returnGrid) yield grid
};

/**
 * @param {Number} rows number of rows in the grid (must be an odd integer)
 * @param {Number} cols number of columns in the grid (must be an integer)
 * @return {Array} grid
 */
const DFS = function(rows,cols){
  const iterator = DFS.generator(rows,cols,true);

  let grid;
  for(let x of iterator) grid = x;

  return grid
};
DFS.generator = generator;

module.exports = DFS

},{}],2:[function(require,module,exports){
'use strict';
/**
 * @constructor Node
 * @param {Number} x
 * @param {Number} y
 */
const Node = function(x,y,i){
   this.x = x;
   this.y = y;
   this.movementCost = i;
};

module.exports = Node;

},{}],3:[function(require,module,exports){
'use strict';

const Node = require('./Node');
// const Heap = require('./Heap');

const heuristic = function(a,b){
   // manhattan distance
   return Math.abs(b.x - a.x) + Math.abs(b.y - a.y)
   // euclidian distance
   // return Math.sqrt(Math.pow(b.y-a.y,2)+Math.pow(b.x-a.x,2));
};

const neighbors = function(grid,node,diagonal){
   let { x, y } = node;
   let width = grid[0].length;
   let height = grid.length;
   // return [[x-1,y],[x+1,y],[x,y-1],[x,y+1],[x-1,y-1],[x+1,y+1],[x-1,y+1],[x+1,y-1]].filter(([x,y]) => x >= 0 && y >= 0 && x < width && y < height).map(([x,y]) => grid[y][x]).filter(x => x.movementCost != 0);
   let neighbors = [];
   for(let X = -1; X <= 1; X++){
      for(let Y = -1; Y <= 1; Y++){
         if(X != x || Y != y){
            if((Math.abs(X) === Math.abs(Y) && diagonal) || Math.abs(X) !== Math.abs(Y)){
               neighbors.push([x+X,y+Y]);
            }
         }
      }
   }
   return neighbors
      .filter(([x,y]) => x >= 0 && y >= 0 && x < width && y < height)
      .map(([x,y]) => grid[y][x])
      .filter(x => x.movementCost != 0);
};
const comp = function(a,b){
   return a.f <= b.f
};

const generator = function*(grid,start,goal,{ onClose, onOpen, onFind, allowDiagonal }){
   // set containing the start
   // let openSet = new Heap(comp);
   let openSet = [];
   // empty set
   let closedSet = [];

   // sets the f, g and h cost for the starting node
   start.g = 0;
   start.f = start.g + heuristic(start,goal);
   if(onOpen) yield onOpen(start.x,start.y,start);
   openSet.push(start);

   let current;
   while(/*current = openSet.pop()*/openSet.length > 0){
      // selects the current node to the node with the lower f cost in the open set
      let current = openSet.reduce((previous,current) => current.f < previous.f ? current : previous);

      // if the current node is the goal
      if(current.x == goal.x && current.y == goal.y){
         // let path = [];
         while(current.parent){
            // path.push([current.x,current.y]);
            if(onFind) yield onFind(current.x,current.y,current);
            current = current.parent;
         }
         if(onFind) yield onFind(current.x,current.y,current);
         return
      }

      // removes the current node to the open set
      openSet.splice(openSet.indexOf(current),1);

      // adds the current node to the closed set
      closedSet.push(current);
      if(onClose) yield onClose(current.x,current.y,current);


      for(let n of neighbors(grid,current,allowDiagonal)){
         // for each neighbors we check if it has already been visited
         if(!closedSet.includes(n)){
            // if not we set g, h and f costs
            n.parent = current;
            n.g = n.parent.g + n.movementCost;
            n.h = heuristic(n,goal);
            n.f = n.h + n.g;
            // we check if the neighbor is not in the open set
            if(!openSet.includes(n)){
               // if so we need to check if the g cost is lower
               if(current.g + n.movementCost < n.g){
                  // if so we update the g and f costs and set the new parent
                  n.parent = current;
                  n.g = n.parent.g + n.movementCost;
                  n.f = n.h + n.g;
               }
               openSet.push(n);
               if(onOpen) yield onOpen(n.x,n.y,n);
            }
         }
      }
   }
   return false
};

const aStar = function(grid,start,goal){
   let path = [];
   let iterator = generator(grid,start,goal,{
      onFind(x,y){
         return [x,y]
      }
   });
   for(let [ x,y ] of iterator){
      path.push([x,y]);
   }
   return path.reverse();
};
aStar.generator = generator;
module.exports = aStar;

},{"./Node":2}],4:[function(require,module,exports){
'use strict';
const { generator } = require('./DFS/DFS');
const aStar = require('./aStar').generator;
const Node = require('./Node');

const SIZE = 2;
const SPEED = 10;
let COLS = Math.ceil(window.innerWidth/SIZE);
let ROWS = Math.ceil(window.innerHeight/SIZE);

const OPEN = '#ffc952';
const CLOSED = '#ff7473';
const PATH = '#4bf442';

if(COLS % 2 == 0) COLS--;
if(ROWS % 2 == 0) ROWS--;

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

canvas.setAttribute('width',COLS*SIZE);
canvas.setAttribute('height',ROWS*SIZE);

document.body.appendChild(canvas);

function cycle(){
   var unix = (Math.round(+new Date()/1000)) // Get current date in seconds (unix time)
   var unixStr = unix.toString(16); // convert to hex
   var unixPrint = unixStr.substr(unixStr.length - 6); // get last 6 chars for use in the hex color
   var color = '#'+unixPrint.toString();
   var oppcolor = hexToComplimentary(color);
   var testcolor = hexToComplimentary2(color);
   ctx.fillStyle = '000000';
   ctx.beginPath();
   ctx.rect(0,0,canvas.width,canvas.height);
   ctx.fill();
   ctx.fillStyle = color;
   const iterator = generator(COLS,ROWS,true);
   function maze(iterator,next){
      return function(){
        let i = SPEED*5;
        do{
         let [ x, y ] = next.value;
         if(typeof(x) != 'number'){
            let grid = next.value.map((s,y) =>  s.map((wall,x) => new Node(x,y,wall == 1 ? 0 : 1)));
            let algorithm = aStar(grid,grid[1][1],grid[COLS-2][ROWS-2],{
               onClose(x,y){
                  ctx.fillStyle = oppcolor;
                  ctx.beginPath();
                  ctx.rect(y*SIZE,x*SIZE,SIZE,SIZE);
                  ctx.fill();
               },
               onOpen(x,y){
                  ctx.fillStyle = OPEN;
                  ctx.beginPath();
                  ctx.rect(y*SIZE,x*SIZE,SIZE,SIZE);
                  ctx.fill();
               },
               onFind(x,y){
                  ctx.fillStyle = testcolor;
                  ctx.beginPath();
                  ctx.rect(y*SIZE,x*SIZE,SIZE,SIZE);
                  ctx.fill();
               },
               allowDiagonal:false
            });
            requestAnimationFrame(solve(algorithm,algorithm.next()));
            return
         }
         ctx.beginPath();
         ctx.rect(x*SIZE,y*SIZE,SIZE,SIZE);
         ctx.fill();

         next = iterator.next();
      }while(!next.done && --i);

      if(!next.done){
         requestAnimationFrame(maze(iterator,next));
      }
     }
   }
   function solve(iterator,next){
      return function(){
        let i = 5*SPEED;
        do{
         next = iterator.next();
      }while(!next.done && --i);

      if(!next.done){
         requestAnimationFrame(solve(iterator,next));
      }else{
         setTimeout(cycle,4000);
      }
     }
   }
   requestAnimationFrame(maze(iterator,iterator.next()));
}
cycle();

},{"./DFS/DFS":1,"./Node":2,"./aStar":3}]},{},[4]);
function hexToComplimentary(hex){

    // Convert hex to rgb
    // Credit to Denis http://stackoverflow.com/a/36253499/4939630
    var rgb = 'rgb(' + (hex = hex.replace('#', '')).match(new RegExp('(.{' + hex.length/3 + '})', 'g')).map(function(l) { return parseInt(hex.length%2 ? l+l : l, 16); }).join(',') + ')';

    // Get array of RGB values
    rgb = rgb.replace(/[^\d,]/g, '').split(',');

    var r = rgb[0], g = rgb[1], b = rgb[2];

    // Convert RGB to HSL
    // Adapted from answer by 0x000f http://stackoverflow.com/a/34946092/4939630
    r /= 255.0;
    g /= 255.0;
    b /= 255.0;
    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2.0;

    if(max == min) {
        h = s = 0;  //achromatic
    } else {
        var d = max - min;
        s = (l > 0.5 ? d / (2.0 - max - min) : d / (max + min));

        if(max == r && g >= b) {
            h = 1.0472 * (g - b) / d ;
        } else if(max == r && g < b) {
            h = 1.0472 * (g - b) / d + 6.2832;
        } else if(max == g) {
            h = 1.0472 * (b - r) / d + 2.0944;
        } else if(max == b) {
            h = 1.0472 * (r - g) / d + 4.1888;
        }
    }

    h = h / 6.2832 * 360.0 + 0;

    // Shift hue to opposite side of wheel and convert to [0-1] value
    h+= 120;
    if (h > 360) { h -= 360; }
    h /= 360;

    // Convert h s and l values into r g and b values
    // Adapted from answer by Mohsen http://stackoverflow.com/a/9493060/4939630
    if(s === 0){
        r = g = b = l; // achromatic
    } else {
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;

        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    r = Math.round(r * 255);
    g = Math.round(g * 255); 
    b = Math.round(b * 255);

    // Convert r b and g values to hex
    rgb = b | (g << 8) | (r << 16); 
    return "#" + (0x1000000 | rgb).toString(16).substring(1);
}

function hexToComplimentary2(hex){

    // Convert hex to rgb
    // Credit to Denis http://stackoverflow.com/a/36253499/4939630
    var rgb = 'rgb(' + (hex = hex.replace('#', '')).match(new RegExp('(.{' + hex.length/3 + '})', 'g')).map(function(l) { return parseInt(hex.length%2 ? l+l : l, 16); }).join(',') + ')';

    // Get array of RGB values
    rgb = rgb.replace(/[^\d,]/g, '').split(',');

    var r = rgb[0], g = rgb[1], b = rgb[2];

    // Convert RGB to HSL
    // Adapted from answer by 0x000f http://stackoverflow.com/a/34946092/4939630
    r /= 255.0;
    g /= 255.0;
    b /= 255.0;
    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2.0;

    if(max == min) {
        h = s = 0;  //achromatic
    } else {
        var d = max - min;
        s = (l > 0.5 ? d / (2.0 - max - min) : d / (max + min));

        if(max == r && g >= b) {
            h = 1.0472 * (g - b) / d ;
        } else if(max == r && g < b) {
            h = 1.0472 * (g - b) / d + 6.2832;
        } else if(max == g) {
            h = 1.0472 * (b - r) / d + 2.0944;
        } else if(max == b) {
            h = 1.0472 * (r - g) / d + 4.1888;
        }
    }

    h = h / 6.2832 * 360.0 + 0;

    // Shift hue to opposite side of wheel and convert to [0-1] value
    h+= 240;
    if (h > 360) { h -= 360; }
    h /= 360;

    // Convert h s and l values into r g and b values
    // Adapted from answer by Mohsen http://stackoverflow.com/a/9493060/4939630
    if(s === 0){
        r = g = b = l; // achromatic
    } else {
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;

        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    r = Math.round(r * 255);
    g = Math.round(g * 255); 
    b = Math.round(b * 255);

    // Convert r b and g values to hex
    rgb = b | (g << 8) | (r << 16); 
    return "#" + (0x1000000 | rgb).toString(16).substring(1);
}  