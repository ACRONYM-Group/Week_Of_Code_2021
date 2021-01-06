function onConnected() {

}

function onMessage(data) {
    if (data["key"] == "map" && data["db_key"] == "gamedata") {
        console.log("Got Grid");
        grid = data["val"];
        var d = new Date();
        var n = d.getTime();
        console.log(n);
        draw_grid();
    }
    console.log(data);
    setInterval(draw_grid, 100);
}

ACIConnection = new connection("scienceandpizza.com", 8766, onConnected, onMessage);
ACIConnection.start();

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
            choosen_type_priority = 0;
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
    tile_size = 16;
    console.log("Drawing");
    var d = new Date();
    var n = d.getTime();
    console.log(n);
    w = 0;
    g = 0;

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    for (var chunk = 0; chunk < 1; chunk++) {
        for (var tile = 0; tile < 10000; tile++) {
            chunk_y = Math.floor(chunk/50);
            chunk_x = chunk - (chunk_y*50);
            tile_y = Math.floor(tile/100);
            tile_x = tile - (tile_y*100);
            canvas_x = (chunk_x*100*tile_size) + (tile_x*tile_size);
            canvas_y = (chunk_y*100*tile_size) + (tile_y*tile_size);

            tile_type = grid[chunk][tile];
            if (tile_type == "g") {
                ctx.fillStyle = "#00FF00";
                g += 1;
            } else if (tile_type == "w") {
                ctx.fillStyle = "#8f6d0e";
                w += 1;
            }
            ctx.fillRect(canvas_x+camera_x_offset, canvas_y+camera_y_offset, tile_size-1, tile_size-1);
        }
    }

    console.log("w " + w);
    console.log("g " + g);
    var d = new Date();
    var n = d.getTime();
    console.log(n);
}

canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx = canvas.getContext("2d");
ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);


setTimeout(function() {
    ACIConnection.a_authenticate("bots.woc_2021", "AbDc314")
}, 500);
    
setTimeout(function() {
    ACIConnection.getRequest("map", "gamedata");
    var d = new Date();
    var n = d.getTime();
    console.log(n);
}, 5000);

var mouse_is_down = false;
var last_mouse_x = 0;
var last_mouse_y = 0;
var camera_x_offset = 0;
var camera_y_offset = 0;
canvas.addEventListener("mousemove", e => {
    if (mouse_is_down) {
        camera_x_offset += e.x - last_mouse_x;
        camera_y_offset += e.y - last_mouse_y;
        last_mouse_x = e.x;
        last_mouse_y = e.y;
    }
});

canvas.addEventListener("mousedown", e => {
    mouse_is_down = true;
    last_mouse_x = e.x;
    last_mouse_y = e.y;
});

canvas.addEventListener("mouseup", e => {
    mouse_is_down = false;
});