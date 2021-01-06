var myGamePiece;

function startGame() {
	myGamePiece = new component(64, 64, "beta-player.png", window.innerWidth/2, window.innerHeight/2, "image");
	myGameArea.start();
}

var myGameArea = {
	canvas: document.getElementById("canvas"),
	start: function () {
		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
		this.context = this.canvas.getContext("2d");
		this.frameNo = 0;
		this.interval = setInterval(updateGameArea, 20);
		window.addEventListener("keydown", function (e) {
			e.preventDefault();
			myGameArea.keys = myGameArea.keys || [];
			myGameArea.keys[e.keyCode] = e.type == "keydown";
		});
		window.addEventListener("keyup", function (e) {
			myGameArea.keys[e.keyCode] = e.type == "keydown";
		});
	},
	stop: function () {
		clearInterval(this.interval);
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
	this.speed = 0;
	this.angle = 0;
	this.moveAngle = 0;
	this.x = x;
	this.y = y;
	this.update = function () {
		ctx = myGameArea.context;
		ctx.save();
		ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
       if (type == "image") {
      ctx.drawImage(
        this.image,
        this.width / -2,
        this.height / -2,
        this.width, 
        this.height);
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
	this.newPos = function () {
		this.angle += (this.moveAngle * Math.PI) / 180;
		this.x += this.speed * Math.sin(this.angle);
		this.y -= this.speed * Math.cos(this.angle);
	};
}

function updateGameArea() {
	myGameArea.clear();
	myGamePiece.moveAngle = 0;
	myGamePiece.speed = 0;
	if (myGameArea.keys && myGameArea.keys[65]) {
		myGamePiece.moveAngle = -1;
	}
	if (myGameArea.keys && myGameArea.keys[68]) {
		myGamePiece.moveAngle = 1;
	}
	if (myGameArea.keys && myGameArea.keys[87]) {
		myGamePiece.speed = 1;
	}
	if (myGameArea.keys && myGameArea.keys[83]) {
		myGamePiece.speed = -1;
	}
	myGamePiece.newPos();
	myGamePiece.update();
}