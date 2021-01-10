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
			document.getElementById("selected_paint").style.backgroundColor =
				tile_types[type_index]["color"];
		}
	}
}

function onMessage(data) {
	if (
		data["cmd"] == "get_value" &&
		data["key"] == "map" &&
		data["db_key"] == "gamedata"
	) {
		console.log("Got Grid");
		grid = data["val"];
		var d = new Date();
		var n = d.getTime();
		console.log(n);
		draw_grid();
		console.log(grid[0].length);
		remove_prompt("loading_map");
		console.log(grid[0]);
		setInterval(loop, 10);

		for (var i = 0; i < 1; i++) {
			units.push(
				new component(
					64,
					64,
					"graphics/beta-player.png",
					getRandomInt(10 * tile_size),
					getRandomInt(10 * tile_size),
					"image"
				)
			);
		}
	}

	if (
		data["cmd"] == "set_value" &&
		data["key"] == "map" &&
		data["db_key"] == "gamedata"
	) {
		remove_prompt("submit_map_loading");
	}

	if (data["cmd"] == "a_auth") {
		remove_prompt("auth");
		ACIConnection.getRequest("map", "gamedata");
		var d = new Date();
		var n = d.getTime();
		console.log(n);
		add_prompt(
			"Loading Map...",
			"this may take a while",
			"loading_map",
			"loading"
		);
		ACIConnection.setRequest("player", "gamedata", {
			pos: [0, 0],
			dir: 3.1415926535,
			vel: [1, 0],
		});
		ACIConnection.write_to_disk("gamedata");
	}

	if (data["cmd"] == "write_to_disk") {
		console.log(data);
	}

	if (
		data["cmd"] == "get_value" &&
		data["key"] == "player" &&
		data["db_key"] == "gamedata"
	) {
		units[0].x = data["val"]["pos"][0] * tile_size;
		units[0].y = data["val"]["pos"][1] * tile_size;
		units[0].angle = data["val"]["dir"];
	}
}

ACIConnection = new connection(
	"scienceandpizza.com",
	8766,
	onConnected,
	onMessage
);
ACIConnection.start();

var myGamePiece;
var units = [];
var tile_size = 32;
var chunk_size = 32;
var map_width_in_chunks = 12;
var brush_size = 4;
var tile_type_to_draw = "s";
var keyboard = [];
var grid = [];
var prompts = {};
var debug_mode = true;
tile_types = [
	{ id: "g", name: "grass", color: "#009900", blocks: false },
	{ id: "e", name: "bare soil", color: "#999999", blocks: false },
	{ id: "S", name: "sand", color: "#8f6d0e", blocks: true },
	{ id: "s", name: "stone", color: "#756b51", blocks: true },
	{ id: "r", name: "robot base", color: "#ffe600", blocks: true },
	{ id: "a", name: "alien base", color: "#5e035a", blocks: true },
	{ id: "w", name: "wall", color: "#c9c9c9", blocks: true },
];

for (type in tile_types) {
	document.getElementById("paint_type_selector").innerHTML +=
		"<div class='paint_icon' style='background-color: " +
		tile_types[type]["color"] +
		";' onclick=\"set_tile_brush('" +
		tile_types[type]["id"] +
        "')\"></div>";
}

class tile {
	constructor(type) {
		this.type = tile_types[type].name;
		this.color = tile_types[type].color;
		this.blocks = tile_types[type].blocks;
	}
}

function submit_map() {
	ACIConnection.setRequest("map", "gamedata", grid);
	add_prompt(
		"Submitting map...",
		"please wait",
		"submit_map_loading",
		"loading"
	);
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

function handle_user_input() {
	// Once Per Frame:
	myGamePiece.speedX = 0;
	myGamePiece.speedY = 0;
	if (keyboard && (keyboard[65] || keyboard[37])) {
		myGamePiece.speedX = -tile_size * myGamePiece.max_speedX;
	}

	//right | d = 68, arrow right = 39
	if (keyboard && (keyboard[68] || keyboard[39])) {
		myGamePiece.speedX = tile_size * myGamePiece.max_speedX;
	}

	//up | w = 87, arrow up = 38
	if (keyboard && (keyboard[87] || keyboard[38])) {
		myGamePiece.speedY = -tile_size * myGamePiece.max_speedY;
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

    //Space bar (Reset Camera offsets)
    if (keyboard && (keyboard[32])) {
        camera_x_offset = 0;
        camera_y_offset = 0;
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

canvas.addEventListener("mousemove", (e) => {
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

canvas.addEventListener("mousedown", (e) => {
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

canvas.addEventListener("mouseup", (e) => {
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
