function onConnected() {
    ACIConnection.a_authenticate("bots.woc_2021", "AbDc314");
    add_prompt("Authenicating...", "Please Wait", "auth", "loading");
    myGamePiece = new component(
        64,
        64,
        "beta-player.png",
        window.innerWidth / 2,
        window.innerHeight / 2,
        "image"
    );
}

function set_tile_brush(type) {
    tile_type_to_draw = type;
    console.log(type);
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
        remove_prompt("loading_map");
        setInterval(loop, 10);

        for (var i = 0; i < 1; i++) {
            units.push(new component(64, 64, "beta-player.png", getRandomInt(100*tile_size), getRandomInt(100*tile_size), "image"));
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
    }

    if (data["cmd"] == "get_value" && data["key"] == "player" && data["db_key"] == "gamedata") {
        units[0].x = data["val"]["pos"][0];
        units[0].y = data["val"]["pos"][1];
        units[0].angle = data["val"]["dir"];
        console.log("Putting unit at " + data["val"]["pos"][0] + "," + data["val"]["pos"][1] + " angle: "  + data["val"]["dir"]);
    }
}

ACIConnection = new connection("scienceandpizza.com", 8766, onConnected, onMessage);
ACIConnection.start();

var myGamePiece;
var units = [];
var tile_size = 32;
var chunk_size = 100;
var map_width_in_chunks = 4;
var brush_size = 4;
var tile_type_to_draw = "s";
var keyboard = [];
var grid = [];
var prompts = {};
var debug_mode = true;
tile_types = [
                {"id":"g", "name":"grass", "color":"#009900", "blocks":false},
                {"id":"s", "name":"stone", "color":"#999999", "tiles":false},
                {"id":"w", "name":"wall", "color":"#8f6d0e", "block":true},
                {"id":"e", "name":"wall", "color":"#756b51", "block":true},
                {"id":"a", "name":"wall", "color":"#2e2e2e", "block":true},
                {"id":"d", "name":"wall", "color":"#7dba6c", "block":true},
                {"id":"l", "name":"wall", "color":"#3d4ae0", "block":true},
                {"id":"S", "name":"wall", "color":"#f0c690", "block":true},
                {"id":"r", "name":"wall", "color":"#d6547d", "block":true},
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

function x_y_to_sequetnial_coords(x, y) {
    tile_x = x;
    tile_y = y;

    chunk_x = Math.floor(tile_x/chunk_size);
    tile_x -= chunk_x*chunk_size;

    chunk_y = Math.floor(tile_y/chunk_size);
    tile_y -= chunk_y*chunk_size;

    sequential_chunk_number = chunk_y*4*chunk_size + chunk_x*chunk_size;
    sequential_tile_number = tile_y*100+tile_x;

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

function draw_grid() {
    if (camera_x_offset > 100) {
        camera_x_offset = 100;
    } else if (camera_x_offset < -(100*tile_size-canvas.clientWidth) - 100) {
        camera_x_offset = -(100*tile_size-canvas.clientWidth) - 100;
    }

    if (camera_y_offset > 100) {
        camera_y_offset = 100;
    } else if (camera_y_offset < -(100*tile_size-canvas.clientHeight) - 100) {
        camera_y_offset = -(100*tile_size-canvas.clientHeight) - 100;
    }
    var d = new Date();
    var n = d.getTime();

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
            for (type in tile_types) {
                if (tile_types[type]["id"] == tile_type) {
                    ctx.fillStyle = tile_types[type]["color"];
                }
            }
            ctx.fillRect(canvas_x+camera_x_offset, canvas_y+camera_y_offset, tile_size-1, tile_size-1);
        }
    }
    var d = new Date();
    var n = d.getTime() - n;
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
		myGamePiece.speedX = -2;
	}

	//right | d = 68, arrow right = 39
	if (keyboard && (keyboard[68] || keyboard[39])) {
		myGamePiece.speedX = 2;
	}

	//up | w = 87, arrow up = 38
	if (keyboard && (keyboard[87] || keyboard[38])) {
		myGamePiece.speedY = -2;
	}

	//down | s = 83, arrow down = 40
	if (keyboard && (keyboard[83] || keyboard[40])) {
		myGamePiece.speedY = 2;
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
    draw_tile_x = Math.floor((last_mouse_x-camera_x_offset)/tile_size);
    draw_tile_y = Math.floor((last_mouse_y-camera_y_offset)/tile_size);

    convert = x_y_to_sequetnial_coords(draw_tile_x, draw_tile_y);

    sequential_chunk_number = convert[0];
    sequential_tile_number = convert[1];

    chunk_y = Math.floor(draw_tile_y/chunk_size);
    chunk_x = Math.floor(draw_tile_x/chunk_size);

    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    
    for (var x = -brush_size; x <= brush_size; x++) {
        for (var y = -brush_size; y <= brush_size; y++) {
            ctx.strokeRect(((draw_tile_x+x)+(chunk_x*chunk_size))*tile_size+camera_x_offset, ((draw_tile_y+y)+(chunk_y*chunk_size))*tile_size+camera_y_offset, tile_size, tile_size);

            if (middle_mouse_is_down) {
                convert = x_y_to_sequetnial_coords(draw_tile_x+x, draw_tile_y+y);

                sequential_chunk_number = convert[0];
                sequential_tile_number = convert[1];
                grid[sequential_chunk_number] = grid[sequential_chunk_number].substring(0, sequential_tile_number) + tile_type_to_draw + grid[sequential_chunk_number].substring(sequential_tile_number + 1);
                
            }
        }
    }

    //ctx.strokeRect((draw_tile_x+(chunk_x*chunk_size)+camera_x_offset)*tile_size, (draw_tile_y+(chunk_y*chunk_size)+camera_y_offset)*tile_size, tile_size, tile_size);

    // if (middle_mouse_is_down) {
    //     grid[sequential_chunk_number] = grid[sequential_chunk_number].substring(0, sequential_tile_number) + tile_type_to_draw + grid[sequential_chunk_number].substring(sequential_tile_number + 1);
        
    // }
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

	//update the object's understanding of where it is and how to draw itself
	this.update = function () {
		ctx = canvas.getContext("2d");
		ctx.save();
		ctx.translate(this.x+camera_x_offset, this.y+camera_y_offset);

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
            camera_x_offset -= this.speedX;
            camera_y_offset -= this.speedY;
            this.mouseX = mouseX;
            this.mouseY = mouseY;
            this.angle = ((Math.atan2((mouseX- (this.x + camera_x_offset)), ((this.y + camera_y_offset) - mouseY))));
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
        console.log("right mouse is down");
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
    console.log(e.keyCode);
});

window.addEventListener("keyup", function (e) {
    keyboard[e.keyCode] = e.type == "keydown";
    console.log("Key up" + e.keyCode);
});


set_tile_brush("g");