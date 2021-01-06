function onConnected() {}

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

var myGamePiece;

//main
function startGame() {
	myGamePiece = new component(
		64,
		64,
		"beta-player.png",
		window.innerWidth / 2,
		window.innerHeight / 2,
		"image"
	);
	myGameArea.start();
}

var myGameArea = {
	canvas: document.getElementById("canvas"),
	start: function () {
		//canvas modifications and context
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		this.context = this.canvas.getContext("2d");
		this.frameNo = 0;

		//Interval loop setup here
		this.interval = setInterval(updateGameArea, 20);

		//Keydown and keyup event listeners
		window.addEventListener("keydown", function (e) {
			e.preventDefault();
			myGameArea.keys = myGameArea.keys || [];
			myGameArea.keys[e.keyCode] = e.type == "keydown";
		});
		window.addEventListener("keyup", function (e) {
			myGameArea.keys[e.keyCode] = e.type == "keydown";
		});

		//mouse movement listener
		canvas.addEventListener("mousemove", function (e) {
			var cRect = canvas.getBoundingClientRect(); // Gets CSS pos, and width/height
			myGameArea.mouseX = Math.round(e.clientX - cRect.left); // Subtract the 'left' of the canvas
			myGameArea.mouseY = Math.round(e.clientY - cRect.top); // from the X/Y positions to make
		});
	},

	//stop game loop
	stop: function () {
		clearInterval(this.interval);
	},

	//clear entire canvas
	clear: function () {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	},
};

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
		ctx = myGameArea.context;
		ctx.save();
		ctx.translate(this.x, this.y);

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
	this.newPos = function (mouseX, mouseY) {
		this.x += this.speedX;
		this.y += this.speedY;
		this.mouseX = mouseX;
		this.mouseY = mouseY;
		this.angle = Math.atan2(mouseX - this.x, this.y - mouseY);
	};
}

//main game logic loop
function updateGameArea() {
	//clear canvas
	myGameArea.clear();

	//reset rate of rotation
	myGamePiece.moveAngle = 0;

	//reset speed at which the character is moving
	myGamePiece.speedX = 0;
	myGamePiece.speedY = 0;

	//if keys are pressed change either the angle the character is rotating in or the speed it's moving.

	//left | a = 65, arrow left = 37
	if (myGameArea.keys && (myGameArea.keys[65] || myGameArea.keys[37])) {
		myGamePiece.speedX = -1;
	}

	//right | d = 68, arrow right = 39
	if (myGameArea.keys && (myGameArea.keys[68] || myGameArea.keys[39])) {
		myGamePiece.speedX = 1;
	}

	//up | w = 87, arrow up = 38
	if (myGameArea.keys && (myGameArea.keys[87] || myGameArea.keys[38])) {
		myGamePiece.speedY = -1;
	}

	//down | s = 83, arrow down = 40
	if (myGameArea.keys && (myGameArea.keys[83] || myGameArea.keys[40])) {
		myGamePiece.speedY = 1;
	}
	myGamePiece.newPos(myGameArea.mouseX, myGameArea.mouseY);
	myGamePiece.update();
}
