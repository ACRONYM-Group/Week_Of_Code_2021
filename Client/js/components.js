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
		ctx.translate(
			this.x - myGamePiece.x + canvas.clientWidth / 2 + camera_x_offset,
			this.y - myGamePiece.y + canvas.clientHeight / 2 + camera_y_offset
		);

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
			this.angle = Math.atan2(
				mouseX - (canvas.clientWidth / 2 + camera_x_offset),
				canvas.clientHeight / 2 + camera_y_offset - mouseY
			);
		}
	};
}
