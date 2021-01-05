grid = [];
block_types = [{"name":"grass", "color":"#009900"},{"name":"stone", "color":"#999999"}]
function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

class tile {
    constructor(type, color) {
        this.type = type;
        this.color = color;
    }
}

function generate_grid(width, height) {
    for (var x = 0; x < width; x++) {
        grid[x] = []
        for (var y = 0; y < height; y++) {
            block_type = block_types[getRandomInt(block_types.length)].name;
            block_color = block_types[getRandomInt(block_types.length)].color;
            console.log(block_type);
            grid[x][y] = new tile(block_type, block_color);
        }
    }
}

function draw_grid() {
    //tile_size = canvas.clientWidth/grid.length;
    tile_size = 30;
    for (var x = 0; x < grid.length; x++) {
        for (var y = 0; y < grid[x].length; y++) {
            ctx.fillStyle = grid[x][y].color;
            ctx.fillRect(x*tile_size, y*tile_size, tile_size, tile_size);
        }
    }
}

canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx = canvas.getContext("2d");
ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);

generate_grid(100, 50);
draw_grid();
