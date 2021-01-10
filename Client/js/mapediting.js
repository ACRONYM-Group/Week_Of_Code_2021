function set_tile_brush(type) {
	tile_type_to_draw = type;
	for (type_index in tile_types) {
		if (tile_types[type_index]["id"] == type) {
			document.getElementById("selected_paint").style.backgroundColor =
				tile_types[type_index]["color"];
		}
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

function paint_brush() {
	grid_coordinates = screen_to_grid_coordinates(last_mouse_x, last_mouse_y);
	plain_grid_coordinates = grid_to_plain_x_y_coordinates(
		grid_coordinates[0][0],
		grid_coordinates[0][1],
		grid_coordinates[1][0],
		grid_coordinates[1][1]
	);
	screen_coordinates = grid_to_screen_coordinates(
		grid_coordinates[0][0],
		grid_coordinates[0][1],
		grid_coordinates[1][0],
		grid_coordinates[1][1]
	);

	ctx.strokeStyle = "#FFFFFF";
	ctx.lineWidth = 2;

	for (var x = -brush_size; x <= brush_size; x++) {
		for (var y = -brush_size; y <= brush_size; y++) {
			current_tile_screen_x = screen_coordinates[0] + x * tile_size;
			current_tile_screen_y = screen_coordinates[1] + y * tile_size;
			current_tile_plain_x = plain_grid_coordinates[0] + x;
			current_tile_plain_y = plain_grid_coordinates[1] + y;

			ctx.strokeRect(
				current_tile_screen_x,
				current_tile_screen_y,
				tile_size,
				tile_size
			);

			if (middle_mouse_is_down) {
				convert = x_y_to_sequential_coords(
					current_tile_plain_x,
					current_tile_plain_y
				);

				sequential_chunk_number = convert[0];
				sequential_tile_number = convert[1];
				console.log(sequential_chunk_number);
				grid[sequential_chunk_number] =
					grid[sequential_chunk_number].substring(
						0,
						sequential_tile_number
					) +
					tile_type_to_draw +
					grid[sequential_chunk_number].substring(
						sequential_tile_number + 1
					);
			}
		}
	}
}