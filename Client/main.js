function onConnected() {
    myGamePiece = new component(
        64,
        64,
        "beta-player.png",
        window.innerWidth / 2,
        window.innerHeight / 2,
        "image"
    );
}

function onMessage(data) {
    if (data["key"] == "map" && data["db_key"] == "gamedata") {
        console.log("Got Grid");
        grid = data["val"];
        var d = new Date();
        var n = d.getTime();
        console.log(n);
        draw_grid();
        setInterval(loop, 10);

        for (var i = 0; i < 70; i++) {
            units.push(new component(64, 64, "beta-player.png", getRandomInt(100*tile_size), getRandomInt(100*tile_size), "image"));
        }
    }
    console.log(data);
}

ACIConnection = new connection("scienceandpizza.com", 8766, onConnected, onMessage);
ACIConnection.start();

var myGamePiece;
var units = [];
var tile_size = 32;
var keyboard = [];
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

function loop() {
    draw_grid();
    handle_user_input();
    draw_components();
}

function draw_grid() {
    console.log(camera_x_offset);
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
    var d = new Date();
    var n = d.getTime() - n;
}

function draw_components() {
    myGamePiece.newPos("player", last_mouse_x, last_mouse_y);
    myGamePiece.update();
    
    for (unit_index in units) {
        if (units[unit_index].speedX > 4) {
            units[unit_index].speedX = 4;
        } else if (units[unit_index].speedX < -4) {
            units[unit_index].speedX = -4;
        }


        if (units[unit_index].speedY > 4) {
            units[unit_index].speedY = 4;
        } else if (units[unit_index].speedY < -4) {
            units[unit_index].speedY = -4
        }
        units[unit_index].speedX += (getRandomInt(40)-20)/10;
        units[unit_index].speedY += (getRandomInt(40)-20)/10;
        units[unit_index].newPos("unit");
        units[unit_index].update();
    }
}

function handle_user_input() {
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

    var cRect = canvas.getBoundingClientRect(); // Gets CSS pos, and width/height
    //myGameArea.mouseX = Math.round(e.clientX - cRect.left); // Subtract the 'left' of the canvas
    //myGameArea.mouseY = Math.round(e.clientY - cRect.top); // from the X/Y positions to make
    last_mouse_x = e.x;
    last_mouse_y = e.y;
});

canvas.addEventListener("mousedown", e => {
    mouse_is_down = true;
    last_mouse_x = e.x;
    last_mouse_y = e.y;
});

canvas.addEventListener("mouseup", e => {
    mouse_is_down = false;
});



window.addEventListener("keydown", function (e) {
    e.preventDefault();
    keyboard = keyboard || [];
    keyboard[e.keyCode] = e.type == "keydown";
});

window.addEventListener("keyup", function (e) {
    keyboard[e.keyCode] = e.type == "keydown";
    console.log("Key up" + e.keyCode);
});

setTimeout(function() {
    ACIConnection.a_authenticate("bots.woc_2021", "AbDc314");
    setTimeout(function() {
        ACIConnection.getRequest("map", "gamedata");
        var d = new Date();
        var n = d.getTime();
        console.log(n);
    }, 500);
}, 500);
