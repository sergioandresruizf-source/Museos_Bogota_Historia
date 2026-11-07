extends Node2D
## Joystick táctil (solo se muestra en pantallas táctiles). Alimenta las acciones izq/der/arr/abj.
var center: Vector2 = Vector2(50, 246)
var radius: float = 30.0
var touch_index: int = -1
var knob: Vector2 = Vector2.ZERO
var base_tex: Texture2D
var knob_tex: Texture2D


func _ready() -> void:
	base_tex = Game.tex("res://assets/ui/joy_base.png")
	knob_tex = Game.tex("res://assets/ui/joy_knob.png")
	modulate = Color(1, 1, 1, 0.8)


func _input(event: InputEvent) -> void:
	if event is InputEventScreenTouch:
		var ev: InputEventScreenTouch = make_input_local(event)
		if ev.pressed and touch_index == -1 and ev.position.distance_to(center) < radius * 1.8:
			touch_index = ev.index
			_update(ev.position)
		elif not ev.pressed and ev.index == touch_index:
			touch_index = -1
			knob = Vector2.ZERO
			_apply(Vector2.ZERO)
			queue_redraw()
	elif event is InputEventScreenDrag:
		var ev2: InputEventScreenDrag = make_input_local(event)
		if ev2.index == touch_index: _update(ev2.position)


func _update(pos: Vector2) -> void:
	var v := pos - center
	if v.length() > radius: v = v.normalized() * radius
	knob = v
	var s := v / radius
	_apply(Vector2.ZERO if s.length() < 0.18 else s)
	queue_redraw()


func _apply(v: Vector2) -> void:
	_press("der", maxf(v.x, 0.0))
	_press("izq", maxf(-v.x, 0.0))
	_press("abj", maxf(v.y, 0.0))
	_press("arr", maxf(-v.y, 0.0))


func _press(action_name: String, s: float) -> void:
	if s > 0.0: Input.action_press(action_name, s)
	else: Input.action_release(action_name)


func _draw() -> void:
	draw_texture(base_tex, center - base_tex.get_size() / 2.0)
	draw_texture(knob_tex, center + knob - knob_tex.get_size() / 2.0)
