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
		myGamePiece.speedY = tile_size * myGamePiece.max_speedY;
	}

	//- key
	if (keyboard && keyboard[189]) {
		if (brush_size > 0) {
			brush_size -= 1;
		}
		keyboard[189] = false;
	}

	//Space bar (Reset Camera offsets)
	if (keyboard && keyboard[32]) {
		camera_x_offset = 0;
		camera_y_offset = 0;
	}

	//+ key
	if (keyboard && keyboard[187]) {
		brush_size += 1;
		keyboard[187] = false;
	}

	paint_brush_enabled = document.getElementById("paint_brush_checkbox")
		.checked;
	if (debug_mode && paint_brush_enabled) {
		paint_brush();
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