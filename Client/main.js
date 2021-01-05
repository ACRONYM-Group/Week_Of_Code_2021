/*
function onConnected() {}

function onMessage(data) {
	if (data["key"] == "map" && data["db_key"] == "gamedata") {
		console.log("Got Grid");
		grid = data["val"];
		var d = new Date();
		var n = d.getTime();
		console.log(n);
	}
}

ACIConnection = new connection(
	"scienceandpizza.com",
	8766,
	onConnected,
	onMessage
);
ACIConnection.start(); 
*/

var myGamePiece;

function startGame() {
	myGamePiece = new component(64, 64, "beta-player.png", 10, 120, "image");
	myGameArea.start();
}

var myGameArea = {
	canvas: document.getElementById("Canvas"),
	start: function () {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		this.context = this.canvas.getContext("2d");
		this.interval = setInterval(updateGameArea, 20);
		window.addEventListener("keydown", function (e) {
			myGameArea.keys = myGameArea.keys || [];
			myGameArea.keys[e.keyCode] = true;
		});
		window.addEventListener("keyup", function (e) {
			myGameArea.keys[e.keyCode] = false;
		});
	},
	clear: function () {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	},
};

function component(width, height, color, x, y, type) {
	this.type = type;
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
	this.update = function () {
        ctx = myGameArea.context;
        ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.angle);
		if (type == "image") {
            ctx.save();
            ctx.translate(this.x, this.y);
			ctx.rotate(this.angle);
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
            ctx.restore();
		} else {
            ctx.save();
			ctx.translate(this.x, this.y);
			ctx.rotate(this.angle);
            ctx.fillStyle = color;
            ctx.fillRect(this.width / -2, this.height / -2, this.width, this.height);
            ctx.restore();
		}
	};
	this.newPos = function () {
		this.x += this.speedX;
		this.y += this.speedY;
	};
}

function updateGameArea() {
	myGameArea.clear();
	myGamePiece.speedX = 0;
	myGamePiece.speedY = 0;
	if (myGameArea.keys && myGameArea.keys[37]) {
		myGamePiece.speedX = -1;
	}
	if (myGameArea.keys && myGameArea.keys[39]) {
		myGamePiece.speedX = 1;
	}
	if (myGameArea.keys && myGameArea.keys[38]) {
		myGamePiece.speedY = -1;
	}
	if (myGameArea.keys && myGameArea.keys[40]) {
		myGamePiece.speedY = 1;
    }
    myGamePiece.angle += (1 * Math.PI) / 180;
	myGamePiece.newPos();
    myGamePiece.update();
}

function moveup() {
	myGamePiece.speedY = -1;
}

function movedown() {
	myGamePiece.speedY = 1;
}

function moveleft() {
	myGamePiece.speedX = -1;
}

function moveright() {
	myGamePiece.speedX = 1;
}

function clearmove() {
	myGamePiece.speedX = 0;
	myGamePiece.speedY = 0;
}

/*
function draw_grid() {
	ctx = myGameArea.context;
	//tile_size = canvas.clientWidth/grid.length;
	tile_size = 15;
	for (var x = 0; x < grid.length; x++) {
		for (var y = 0; y < grid[x].length; y++) {
			ctx.fillStyle = grid[x][y].color;
			ctx.fillRect(x * tile_size, y * tile_size, tile_size, tile_size);
		}
	}
}

setTimeout(function () {
	ACIConnection.a_authenticate("bots.woc_2021", "AbDc314");
}, 500);

setTimeout(function () {
	ACIConnection.getRequest("map", "gamedata");
	var d = new Date();
	var n = d.getTime();
	console.log(n);
}, 1000);
*/