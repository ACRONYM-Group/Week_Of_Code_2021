function onConnected() {
    ACIConnection.a_authenticate("bots.woc_2021", "AbDc314");
    add_prompt("Authenicating...", "Please Wait", "auth", "loading");
    myGamePiece = new component(
        64,
        64,
        "graphics/beta-player.png",
        800,
        800,
        "image"
    );
}

function set_tile_brush(type) {
    tile_type_to_draw = type;
    for (type_index in tile_types) {
        if (tile_types[type_index]["id"] == type) {
            document.getElementById("selected_paint").style.backgroundColor = tile_types[type_index]["color"];
        }
    }
}

function onMessage(data) {
    if (data["cmd"] == "get_value" && data["key"] == "map" && data["db_key"] == "gamedata") {
        console.log("Got Grid");
        grid = data["val"];
        var d = new Date();
        var n = d.getTime();
        console.log(n);
        draw_grid();
        console.log(grid[0].length);
        remove_prompt("loading_map");
        console.log(grid[0])
        setInterval(loop, 10);

        for (var i = 0; i < 1; i++) {
            units.push(new component(64, 64, "graphics/beta-player.png", getRandomInt(10*tile_size), getRandomInt(10*tile_size), "image"));
        }
    }

    if (data["cmd"] == "set_value" && data["key"] == "map" && data["db_key"] == "gamedata") {
        remove_prompt("submit_map_loading");
    }
    
    if (data["cmd"] == "a_auth") {
        remove_prompt("auth");
        ACIConnection.getRequest("map", "gamedata");
        var d = new Date();
        var n = d.getTime();
        console.log(n);
        add_prompt("Loading Map...", "this may take a while", "loading_map", "loading");
        ACIConnection.setRequest("player","gamedata",{"pos": [0, 0], "dir": 3.1415926535, "vel": [1, 0]});
        ACIConnection.write_to_disk("gamedata");
    }

    if (data["cmd"] == "write_to_disk") {
        console.log(data);
    }

    if (data["cmd"] == "get_value" && data["key"] == "player" && data["db_key"] == "gamedata") {
        units[0].x = data["val"]["pos"][0]*tile_size;
        units[0].y = data["val"]["pos"][1]*tile_size;
        units[0].angle = data["val"]["dir"];
    }
}

ACIConnection = new connection("scienceandpizza.com", 8766, onConnected, onMessage);
ACIConnection.start();

var myGamePiece;
var units = [];
var tile_size = 32;
var chunk_size = 32;
var map_width_in_chunks = 100;
var brush_size = 4;
var tile_type_to_draw = "s";
var keyboard = [];
var grid = [];
var prompts = {};
var debug_mode = true;
tile_types = [
                {"id":"g", "name":"grass", "color":"#009900", "blocks":false},
                {"id":"e", "name":"bare soil", "color":"#999999", "blocks":false},
                {"id":"S", "name":"sand", "color":"#8f6d0e", "blocks":true},
                {"id":"s", "name":"stone", "color":"#756b51", "blocks":true},
                {"id":"r", "name":"robot base", "color":"#ffe600", "blocks":true},
                {"id":"a", "name":"alien base", "color":"#5e035a", "blocks":true},
                {"id":"w", "name":"wall", "color":"#c9c9c9", "blocks":true}
            ];

for (type in tile_types) {
    document.getElementById("paint_type_selector").innerHTML += "<div class='paint_icon' style='background-color: " + tile_types[type]["color"] + ";' onclick=\"set_tile_brush('" + tile_types[type]["id"] + "')\"></div>"
}
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

function sequential_coords_to_x_y(chunks, tiles) {
    chunk_y = Math.floor(chunks/map_width_in_chunks);
    chunk_x = chunks - chunk_y*map_width_in_chunks;

    tile_y = Math.floor(tiles/chunk_size);
    tile_x = tiles - tile_y*chunk_size;

    return [[chunk_x, chunk_y],[tile_x, tile_y]];

}

function x_y_to_sequential_coords(x, y) {
    tile_x = x;
    tile_y = y;

    chunk_x = Math.floor(tile_x/chunk_size);
    tile_x -= chunk_x*chunk_size;

    chunk_y = Math.floor(tile_y/chunk_size);
    tile_y -= chunk_y*chunk_size;

    sequential_chunk_number = chunk_y*map_width_in_chunks + chunk_x;
    sequential_tile_number = tile_y*chunk_size+tile_x;

    return [sequential_chunk_number, sequential_tile_number];
}

function submit_map() {
    ACIConnection.setRequest("map", "gamedata", grid);
    add_prompt("Submitting map...", "please wait", "submit_map_loading", "loading");
}

class prompt {
    constructor(main_text, sub_text, id, type) {
        this.main_text = main_text;
        this.sub_text = sub_text;
        this.id = id;
        this.type = type;
        this.add();
    }

    add() {
        var prompt_box = document.getElementById("prompt_box");
        this.element = document.createElement("div");
        this.element.id = this.id + "_prompt";
        this.element.className = "prompt";
        this.main_text_element = document.createElement("h1");
        this.main_text_element.className = "prompt_main_text";
        this.main_text_element.innerText = this.main_text;
        this.sub_text_element = document.createElement("h5");
        this.sub_text_element.className = "prompt_sub_text";
        this.sub_text_element.innerText = this.sub_text;
        this.element.appendChild(this.main_text_element);
        this.element.appendChild(this.sub_text_element);
        prompt_box.appendChild(this.element);
    }

    remove() {
        this.element.remove();
    }
}
function add_prompt(main_text, sub_text, id, type) {
    prompts[type] = new prompt(main_text, sub_text, id, type);
}

function remove_prompt(id) {
    for (prompt_index in prompts) {
        if (prompts[prompt_index].id == id) {
            prompts[prompt_index].remove();
        }
    }
}

function loop() {

    ACIConnection.getRequest("player", "gamedata");
    draw_grid();
    handle_user_input();
    draw_components();
}

function grid_to_screen_coordinates(cx, cy, tx, ty) {
    x = (((cx*chunk_size) + tx)*tile_size) - myGamePiece.x + canvas.clientWidth/2 + camera_x_offset;
    y = (((cy*chunk_size) + ty)*tile_size) - myGamePiece.y + canvas.clientHeight/2 + camera_y_offset;

    return [x, y];
}

function screen_to_grid_coordinates(x, y) {
    plain_grid_x = Math.floor((last_mouse_x-map_camera_x_offset)/tile_size);
    plain_grid_y = Math.floor((last_mouse_y-map_camera_y_offset)/tile_size);

    chunk_x = Math.floor(plain_grid_x/chunk_size);
    chunk_y = Math.floor(plain_grid_y/chunk_size);

    tile_x = plain_grid_x - chunk_x*chunk_size;
    tile_y = plain_grid_y - chunk_y*chunk_size;

    return [[chunk_x, chunk_y], [tile_x, tile_y]];
}

function grid_to_plain_x_y_coordinates(cx, cy, tx, ty) {
    x = ((cx*chunk_size) + tx)
    y = ((cy*chunk_size) + ty)
    return [x, y];
}

function get_screen_map_offset() {
    map_camera_x_offset = -myGamePiece.x + canvas.clientWidth/2 + camera_x_offset;
    map_camera_y_offset = -myGamePiece.y + canvas.clientHeight/2 + camera_y_offset;
}

function draw_grid() {
    get_screen_map_offset()
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    current_chunk = x_y_to_sequential_coords(Math.floor(myGamePiece.x/tile_size), Math.floor(myGamePiece.y/tile_size))[0];
    chunks_to_draw = [current_chunk,current_chunk-1, current_chunk+1, current_chunk-map_width_in_chunks, current_chunk-map_width_in_chunks-1, current_chunk-map_width_in_chunks+1, current_chunk+map_width_in_chunks, current_chunk+map_width_in_chunks-1, current_chunk+map_width_in_chunks+1];
    //chunks_to_draw = [current_chunk];
    for (chunk_index in chunks_to_draw) {
        chunk = chunks_to_draw[chunk_index];
        if (typeof grid[chunk] === 'undefined') {

        } else {
            for (var tile = 0; tile < chunk_size**2; tile++) {
                tile_type = grid[chunk][tile];
                for (type in tile_types) {
                    if (tile_types[type]["id"] == tile_type) {
                        ctx.fillStyle = tile_types[type]["color"];
                    }
                }

                chunk_y = Math.floor(chunk/map_width_in_chunks);
                chunk_x = chunk - (chunk_y*map_width_in_chunks);
                tile_y = Math.floor(tile/chunk_size);
                tile_x = tile - (tile_y*chunk_size);

                screen_coordinates = grid_to_screen_coordinates(chunk_x, chunk_y, tile_x, tile_y);

                ctx.fillRect(screen_coordinates[0], screen_coordinates[1], tile_size-1, tile_size-1);
            }
        }
    }
}

function draw_components() {
    myGamePiece.newPos("player", last_mouse_x, last_mouse_y);
    myGamePiece.update();
    
    for (unit_index in units) {
        // if (units[unit_index].speedX > 4) {
        //     units[unit_index].speedX = 4;
        // } else if (units[unit_index].speedX < -4) {
        //     units[unit_index].speedX = -4;
        // }


        // if (units[unit_index].speedY > 4) {
        //     units[unit_index].speedY = 4;
        // } else if (units[unit_index].speedY < -4) {
        //     units[unit_index].speedY = -4
        // }
        // units[unit_index].speedX += (getRandomInt(40)-20)/10;
        // units[unit_index].speedY += (getRandomInt(40)-20)/10;
        units[unit_index].newPos("unit");
        units[unit_index].update();
    }
}

function handle_user_input() {


    // Once Per Frame:
    myGamePiece.speedX = 0;
    myGamePiece.speedY = 0;
    if (keyboard && (keyboard[65] || keyboard[37])) {
		myGamePiece.speedX = -tile_size*myGamePiece.max_speedX;
	}

	//right | d = 68, arrow right = 39
	if (keyboard && (keyboard[68] || keyboard[39])) {
		myGamePiece.speedX = tile_size*myGamePiece.max_speedX;
	}

	//up | w = 87, arrow up = 38
	if (keyboard && (keyboard[87] || keyboard[38])) {
		myGamePiece.speedY = -tile_size*myGamePiece.max_speedY;
	}

	//down | s = 83, arrow down = 40
	if (keyboard && (keyboard[83] || keyboard[40])) {
		myGamePiece.speedY = tile_size*myGamePiece.max_speedY;
    }

    //- key
    if (keyboard && (keyboard[189])) {
        if (brush_size > 0) {
            brush_size -= 1;
        }
        keyboard[189] = false;
    }

    //+ key
    if (keyboard && (keyboard[187])) {
        brush_size += 1;
        keyboard[187] = false;
    }
    
    paint_brush_enabled = document.getElementById("paint_brush_checkbox").checked;
    if (debug_mode && paint_brush_enabled) {
        paint_brush();
    }
}

function paint_brush() {
    grid_coordinates = screen_to_grid_coordinates(last_mouse_x, last_mouse_y);
    plain_grid_coordinates = grid_to_plain_x_y_coordinates(grid_coordinates[0][0],grid_coordinates[0][1],grid_coordinates[1][0],grid_coordinates[1][1]);
    screen_coordinates = grid_to_screen_coordinates(grid_coordinates[0][0],grid_coordinates[0][1],grid_coordinates[1][0],grid_coordinates[1][1]);
    
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    
    for (var x = -brush_size; x <= brush_size; x++) {
        for (var y = -brush_size; y <= brush_size; y++) {
            current_tile_screen_x = screen_coordinates[0]+x*tile_size;
            current_tile_screen_y = screen_coordinates[1]+y*tile_size;
            current_tile_plain_x = plain_grid_coordinates[0]+x;
            current_tile_plain_y = plain_grid_coordinates[1]+y;

            ctx.strokeRect(current_tile_screen_x, current_tile_screen_y, tile_size, tile_size);

            if (middle_mouse_is_down) {
                convert = x_y_to_sequential_coords(current_tile_plain_x,current_tile_plain_y);

                sequential_chunk_number = convert[0];
                sequential_tile_number = convert[1];
                console.log(sequential_chunk_number);
                grid[sequential_chunk_number] = grid[sequential_chunk_number].substring(0, sequential_tile_number) + tile_type_to_draw + grid[sequential_chunk_number].substring(sequential_tile_number + 1);
                
            }
        }
    }

}
//character sprite class thing
function component(width, height, color, x, y, type) {
	this.type = type; //type = whether or not it is an image
	if (type == "image") {
		this.image = new Image();
		this.image.src = color;
	}
	this.width = width;
	this.height = height;
    this.speedX = 0;
	this.speedY = 0;   
	this.angle = 0;
	this.x = x;
    this.y = y;
    this.max_speedX = 0.5;
    this.max_speedY = 0.5;

	//update the object's understanding of where it is and how to draw itself
	this.update = function () {
		ctx = canvas.getContext("2d");
        ctx.save();
        ctx.translate(this.x-myGamePiece.x+canvas.clientWidth/2+camera_x_offset, this.y-myGamePiece.y+canvas.clientHeight/2+camera_y_offset);

		//how to draw itself
		ctx.rotate(this.angle);
		if (type == "image") {
			ctx.drawImage(
				this.image,
				this.width / -2,
				this.height / -2,
				this.width,
				this.height
			);
		} else {
			ctx.fillStyle = color;
			ctx.fillRect(
				this.width / -2,
				this.height / -2,
				this.width,
				this.height
			);
		}
		ctx.restore();
	};

	//update understanding of where it is
	this.newPos = function (type, mouseX, mouseY) {
		this.x += this.speedX;
        this.y += this.speedY;
        if (type == "player") {
            // camera_x_offset -= this.speedX;
            // camera_y_offset -= this.speedY;
            this.mouseX = mouseX;
            this.mouseY = mouseY;
            this.angle = ((Math.atan2((mouseX- (canvas.clientWidth/2 + camera_x_offset)), ((canvas.clientHeight/2+ camera_y_offset) - mouseY))));
        }
		
	};
}

canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
ctx = canvas.getContext("2d");
ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);


var mouse_is_down = false;
var middle_mouse_is_down = false;
var last_mouse_x = 0;
var last_mouse_y = 0;
var camera_x_offset = 0;
var camera_y_offset = 0;
var map_camera_x_offset = 0;
var map_camera_y_offset = 0;
canvas.addEventListener("mousemove", e => {
    if (mouse_is_down) {
        var cRect = canvas.getBoundingClientRect(); // Gets CSS pos, and width/height
        camera_x_offset += Math.round(e.clientX - cRect.left) - last_mouse_x;
        camera_y_offset += Math.round(e.clientY - cRect.top) - last_mouse_y;
        last_mouse_x = Math.round(e.clientX - cRect.left); // Subtract the 'left' of the canvas
        last_mouse_y = Math.round(e.clientY - cRect.top); // from the X/Y positions to make
    }
    var cRect = canvas.getBoundingClientRect(); // Gets CSS pos, and width/height
    last_mouse_x = Math.round(e.clientX - cRect.left); // Subtract the 'left' of the canvas
    last_mouse_y = Math.round(e.clientY - cRect.top); // from the X/Y positions to make
});

canvas.addEventListener("mousedown", e => {
    if (e.button == 0) {
        mouse_is_down = true;

        var cRect = canvas.getBoundingClientRect(); // Gets CSS pos, and width/height
        last_mouse_x = Math.round(e.clientX - cRect.left); // Subtract the 'left' of the canvas
        last_mouse_y = Math.round(e.clientY - cRect.top); // from the X/Y positions to make
    }

    if (e.button == 1) {
        middle_mouse_is_down = true;
    }
});

canvas.addEventListener("mouseup", e => {
    if (e.button == 0) {
        mouse_is_down = false;
    }

    if (e.button == 1) {
        middle_mouse_is_down = false;
    }
});



window.addEventListener("keydown", function (e) {
    e.preventDefault();
    keyboard = keyboard || [];
    keyboard[e.keyCode] = e.type == "keydown";
});

window.addEventListener("keyup", function (e) {
    keyboard[e.keyCode] = e.type == "keydown";
});


set_tile_brush("g");