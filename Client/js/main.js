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

set_tile_brush("g");