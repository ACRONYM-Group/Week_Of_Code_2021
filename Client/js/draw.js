function draw_grid() {
	get_screen_map_offset();
	ctx.fillStyle = "#000000";
	ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
	current_chunk = x_y_to_sequential_coords(
		Math.floor(myGamePiece.x / tile_size),
		Math.floor(myGamePiece.y / tile_size)
	)[0];
	chunks_to_draw = [
		current_chunk,
		current_chunk - 1,
		current_chunk + 1,
		current_chunk - map_width_in_chunks,
		current_chunk - map_width_in_chunks - 1,
		current_chunk - map_width_in_chunks + 1,
		current_chunk + map_width_in_chunks,
		current_chunk + map_width_in_chunks - 1,
		current_chunk + map_width_in_chunks + 1,
	];
	//chunks_to_draw = [current_chunk];
	for (chunk_index in chunks_to_draw) {
		chunk = chunks_to_draw[chunk_index];
		if (typeof grid[chunk] === "undefined") {
		} else {
			for (var tile = 0; tile < chunk_size ** 2; tile++) {
				tile_type = grid[chunk][tile];
				for (type in tile_types) {
					if (tile_types[type]["id"] == tile_type) {
						ctx.fillStyle = tile_types[type]["color"];

						chunk_y = Math.floor(chunk / map_width_in_chunks);
						chunk_x = chunk - chunk_y * map_width_in_chunks;
						tile_y = Math.floor(tile / chunk_size);
						tile_x = tile - tile_y * chunk_size;

						screen_coordinates = grid_to_screen_coordinates(
							chunk_x,
							chunk_y,
							tile_x,
							tile_y
						);
						ctx.drawImage(
							tile_types[type]["image"],
							screen_coordinates[0],
							screen_coordinates[1],
							tile_size,
							tile_size
						);
					}
				}
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