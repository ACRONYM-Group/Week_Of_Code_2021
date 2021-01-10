function getRandomInt(max) {
	return Math.floor(Math.random() * Math.floor(max));
}

function screen_to_grid_coordinates(x, y) {
	plain_grid_x = Math.floor((last_mouse_x - map_camera_x_offset) / tile_size);
	plain_grid_y = Math.floor((last_mouse_y - map_camera_y_offset) / tile_size);

	chunk_x = Math.floor(plain_grid_x / chunk_size);
	chunk_y = Math.floor(plain_grid_y / chunk_size);

	tile_x = plain_grid_x - chunk_x * chunk_size;
	tile_y = plain_grid_y - chunk_y * chunk_size;

	return [
		[chunk_x, chunk_y],
		[tile_x, tile_y],
	];
}

function grid_to_plain_x_y_coordinates(cx, cy, tx, ty) {
	x = cx * chunk_size + tx;
	y = cy * chunk_size + ty;
	return [x, y];
}

function get_screen_map_offset() {
	map_camera_x_offset =
		-myGamePiece.x + canvas.clientWidth / 2 + camera_x_offset;
	map_camera_y_offset =
		-myGamePiece.y + canvas.clientHeight / 2 + camera_y_offset;
}

function grid_to_screen_coordinates(cx, cy, tx, ty) {
	x =
		(cx * chunk_size + tx) * tile_size -
		myGamePiece.x +
		canvas.clientWidth / 2 +
		camera_x_offset;
	y =
		(cy * chunk_size + ty) * tile_size -
		myGamePiece.y +
		canvas.clientHeight / 2 +
		camera_y_offset;

	return [x, y];
}

function x_y_to_sequential_coords(x, y) {
	tile_x = x;
	tile_y = y;

	chunk_x = Math.floor(tile_x / chunk_size);
	tile_x -= chunk_x * chunk_size;

	chunk_y = Math.floor(tile_y / chunk_size);
	tile_y -= chunk_y * chunk_size;

	sequential_chunk_number = chunk_y * map_width_in_chunks + chunk_x;
	sequential_tile_number = tile_y * chunk_size + tile_x;

	return [sequential_chunk_number, sequential_tile_number];
}

function sequential_coords_to_x_y(chunks, tiles) {
	chunk_y = Math.floor(chunks / map_width_in_chunks);
	chunk_x = chunks - chunk_y * map_width_in_chunks;

	tile_y = Math.floor(tiles / chunk_size);
	tile_x = tiles - tile_y * chunk_size;

	return [
		[chunk_x, chunk_y],
		[tile_x, tile_y],
	];
}