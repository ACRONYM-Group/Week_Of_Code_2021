var myGamePiece;

function startGame() {
  myGamePiece = new component(30, 30, "red", 10, 120);
  myGameArea.start();
}

var myGameArea = {
  canvas : document.createElement("canvas"),
  start : function() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.context = this.canvas.getContext("2d");
    document.body.insertBefore(this.canvas, document.body.childNodes[3]);
    this.interval = setInterval(updateGameArea, 20);
    window.addEventListener('keydown', function (e) {
      myGameArea.keys = (myGameArea.keys || []);
      myGameArea.keys[e.keyCode] = true;
    })
    window.addEventListener('keyup', function (e) {
      myGameArea.keys[e.keyCode] = false;
    })
  },
  clear : function(){
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

function component(width, height, color, x, y) {
  this.width = width;
  this.height = height;
  this.speedX = 0;
  this.speedY = 0;
  this.x = x;
  this.y = y;    
  this.update = function() {
    ctx = myGameArea.context;
    ctx.fillStyle = color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  this.newPos = function() {
    this.x += this.speedX;
    this.y += this.speedY;        
  }    
}

function updateGameArea() {
  myGameArea.clear();
  myGamePiece.speedX = 0;
  myGamePiece.speedY = 0;
  if (myGameArea.keys && myGameArea.keys[37]) {myGamePiece.speedX = -1; }
  if (myGameArea.keys && myGameArea.keys[39]) {myGamePiece.speedX = 1; }
  if (myGameArea.keys && myGameArea.keys[38]) {myGamePiece.speedY = -1; }
  if (myGameArea.keys && myGameArea.keys[40]) {myGamePiece.speedY = 1; }
  myGamePiece.newPos();
  myGamePiece.update();
  draw_grid();
}

function moveup() {
  myGamePiece.speedY -= 1; 
}

function movedown() {
  myGamePiece.speedY += 1; 
}

function moveleft() {
  myGamePiece.speedX -= 1; 
}

function moveright() {
  myGamePiece.speedX += 1; 
}

var grid = [];
tile_types = [{"name":"grass", "color":"#009900", "blocks":false, "spawn_chance":0.9},{"name":"stone", "color":"#999999", "tiles":false, "spawn_chance":0.3},{"name":"wall", "color":"#8f6d0e", "block":true, "spawn_chance":0.05}]

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

class tile {
    constructor(type) {
        this.type = tile_types[type].name;
        this.color = tile_types[type].color;
        this.blocks = tile_types[type].blocks;
    }
}

function generate_grid(width, height) {
  for (var x= 0; x < width; x++) {
    grid[x] = []
    console.log(x);
    for (var y = 0; y < height; y++) {
      choosen_type = 0;
      hoosen_type_priority = 0;
      for (tile_type in tile_types) {
        tile_type_priority = getRandomInt(100);
        if (tile_type_priority*tile_types[tile_type].spawn_chance > choosen_type_priority) {
            choosen_type = tile_type;
            choosen_type_priority = tile_type_priority;
        }
      }
      try {
        if (grid[x-1][y].type == "stone" || grid[x][y-1].type == "stone") {
          if (getRandomInt(10) > 3) {
            choosen_type = 1
          }
        }
        if ((grid[x-1][y].type == "wall" || grid[x][y-1].type == "wall") && !(grid[x-1][y].type == "wall" && grid[x][y-1].type == "wall")) {
          if (getRandomInt(10) > 2) {
            choosen_type = 2
          }
        }
      } catch (e) {

      }
      grid[x][y] = new tile(choosen_type);
    }
  }
}

function draw_grid() {
  ctx = myGameArea.context;
  //tile_size = canvas.clientWidth/grid.length;
  tile_size = 15;
  for (var x = 0; x < grid.length; x++) {
    for (var y = 0; y < grid[x].length; y++) {
      ctx.fillStyle = grid[x][y].color;
      ctx.fillRect(x*tile_size, y*tile_size, tile_size, tile_size);
    }
  }
}