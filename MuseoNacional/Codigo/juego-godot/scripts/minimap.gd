extends Control
## Minimapa (esquina superior derecha).
var ship_pos: Vector2 = Vector2.ZERO
var t: float = 0.0


func _process(delta: float) -> void:
	t += delta
	if visible: queue_redraw()


func _draw() -> void:
	var sx := size.x / Game.WORLD_W
	var sy := size.y / Game.WORLD_H
	draw_rect(Rect2(Vector2.ZERO, size), Color("1d5f8f"))
	for i in Game.places.size():
		var p: Dictionary = Game.places[i]
		var w := maxf(3.0, roundf(float(p["rx"]) * 2.0 * sx))
		var h := maxf(3.0, roundf(float(p["ry"]) * 2.0 * sy))
		var col := Color("d7c58a")
		if i == Game.SKULL_I: col = Color("d8d8cf") if Game.all_explored() else Color("6a6f78")
		elif Game.save.get("cine_done", false): col = Color("e04a3a")
		elif Game.is_explored(i): col = Color("90e349ff")
		var c: Vector2 = p["posv"]
		draw_rect(Rect2(roundf(c.x * sx - w / 2.0), roundf(c.y * sy - h / 2.0), w, h), col)
	if not Game.all_explored():
		var c: Vector2 = Game.places[Game.SKULL_I]["posv"]
		draw_rect(Rect2(roundf(c.x * sx - 5), roundf(c.y * sy - 4), 10, 8), Color(1, 1, 1, 0.55))
	if int(t * 3.0) % 2 == 0:
		draw_rect(Rect2(roundf(ship_pos.x * sx) - 1, roundf(ship_pos.y * sy) - 1, 3, 3), Color.WHITE)
	draw_rect(Rect2(Vector2.ZERO, size), Color("f0c24a"), false, 1.0)
