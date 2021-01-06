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
    //tile_size = canvas.clientWidth/grid.length;
    tile_size = 1;
    // for (var x = 0; x < grid.length; x++) {
    //     for (var y = 0; y < grid[x].length; y++) {
    //         ctx.fillStyle = grid[x][y].color;
    //         ctx.fillRect(x*tile_size, y*tile_size, tile_size, tile_size);
    //     }
    // }


    // for (var chunk = 0; chunk < 25000; chunk++) {
    //     for (var tile = 0; tile < 10000; tile++) {
    //         chunk_y = Math.floor(chunk/50);
    //         chunk_x = chunk - (chunk_y*50);
    //         tile_y = Math.floor(tile/100);
    //         tile_x = tile - (tile_y*100);
    //         canvas_x = (chunk_x*100*tile_size) + (tile_x*tile_size);
    //         canvas_y = (chunk_y*100*tile_size) + (tile_y*tile_size);

    //         ctx.fillRect(canvas_x*tile_size, canvas_y*tile_size, tile_size, tile_size);
    //     }
    // }

    console.log("Drawing");
    var d = new Date();
    var n = d.getTime();
    console.log(n);
    for (var tile = 0; tile < 25000000; tile++) {
        if (Math.floor(tile/100000) == tile/100000) {
            console.log(tile);
        }
        tile_y = Math.floor(tile/5000);
        tile_x = tile - (tile_y*5000);
        tile_type = grid.charAt(tile);
        if (tile_type = "g") {
            ctx.fillStyle = "#00FF00";
        }
        ctx.fillRect(tile_x*tile_size, tile_y*tile_size, tile_size, tile_size);
    }
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
