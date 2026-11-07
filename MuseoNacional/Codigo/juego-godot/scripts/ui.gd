extends CanvasLayer
## Interfaz: HUD, minimapa, avisos, diálogo de obra, pantalla de título, final y controles táctiles.
## Todo se construye por código; puedes cambiar colores y tamaños de fuente aquí.

var hud: PanelContainer
var hud_count: Label
var hud_place: Label
var minimap: Control
var prompt_panel: PanelContainer
var prompt_label: Label
var toast_panel: PanelContainer
var toast_label: Label
var toast_timer: float = 0.0
var caption_panel: PanelContainer
var caption_label: Label
var dialog: PanelContainer
var d_badge: Label
var d_title: Label
var d_origin: Label
var d_desc: Label
var d_img: TextureRect
var d_ph: Label
var d_img_panel: PanelContainer
var d_close: Button
var d_cb: Callable = Callable()
var title_root: Control
var t_title: Label
var t_sub: Label
var t_play: Button
var t_new: Button
var new_armed: bool = false
var finale_root: Control
var f_title: Label
var f_text: Label
var skip_btn: Button
var fade: ColorRect
var _pending: Array = []
var _hud_was: bool = false

const GOLD := Color("f0c24a")


func _box(bg: Color = Color(0.106, 0.102, 0.141, 0.88), border: Color = GOLD, bw: int = 1) -> StyleBoxFlat:
	var sb := StyleBoxFlat.new()
	sb.bg_color = bg
	sb.border_color = border
	sb.set_border_width_all(bw)
	sb.content_margin_left = 5
	sb.content_margin_right = 5
	sb.content_margin_top = 3
	sb.content_margin_bottom = 3
	return sb


func _label(text: String, size: int, color: Color = Color.WHITE) -> Label:
	var l := Label.new()
	l.text = text
	l.add_theme_font_size_override("font_size", size)
	l.add_theme_color_override("font_color", color)
	return l


func _button(text: String, size: int = 10, gold: bool = true) -> Button:
	var b := Button.new()
	b.text = text
	b.add_theme_font_size_override("font_size", size)
	var n := _box(GOLD if gold else Color("cfd6e4"), Color.BLACK, 1)
	n.content_margin_left = 10
	n.content_margin_right = 10
	n.content_margin_top = 4
	n.content_margin_bottom = 4
	b.add_theme_stylebox_override("normal", n)
	var h := n.duplicate() as StyleBoxFlat
	h.bg_color = n.bg_color.lightened(0.25)
	b.add_theme_stylebox_override("hover", h)
	b.add_theme_stylebox_override("pressed", h)
	b.add_theme_stylebox_override("focus", h)
	b.add_theme_color_override("font_color", Color("1b1a24"))
	b.add_theme_color_override("font_hover_color", Color("1b1a24"))
	b.add_theme_color_override("font_pressed_color", Color("1b1a24"))
	b.add_theme_color_override("font_focus_color", Color("1b1a24"))
	return b


func _bottom_panel(l: Label, y_off: float) -> PanelContainer:
	var p := PanelContainer.new()
	p.add_theme_stylebox_override("panel", _box())
	p.anchor_left = 0.5
	p.anchor_right = 0.5
	p.anchor_top = 1.0
	p.anchor_bottom = 1.0
	p.grow_horizontal = Control.GROW_DIRECTION_BOTH
	p.grow_vertical = Control.GROW_DIRECTION_BEGIN
	p.offset_bottom = y_off
	p.mouse_filter = Control.MOUSE_FILTER_IGNORE
	p.add_child(l)
	p.visible = false
	return p


func build() -> void:
	layer = 10
	# --- HUD
	hud = PanelContainer.new()
	hud.add_theme_stylebox_override("panel", _box())
	hud.position = Vector2(6, 6)
	hud.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var hv := VBoxContainer.new()
	hv.add_theme_constant_override("separation", 0)
	hud.add_child(hv)
	var row := HBoxContainer.new()
	row.add_child(_label("ISLAS EXPLORADAS ", 8))
	hud_count = _label("0/10", 8, GOLD)
	row.add_child(hud_count)
	hv.add_child(row)
	hud_place = _label("", 7, Color("bbccdd"))
	hv.add_child(hud_place)
	hud.visible = false
	add_child(hud)
	# --- minimapa
	minimap = Control.new()
	minimap.set_script(load("res://scripts/minimap.gd"))
	minimap.position = Vector2(344, 6)
	minimap.size = Vector2(50, 61)
	minimap.mouse_filter = Control.MOUSE_FILTER_IGNORE
	minimap.visible = false
	add_child(minimap)
	# --- avisos
	prompt_label = _label("", 8)
	prompt_panel = _bottom_panel(prompt_label, -8)
	add_child(prompt_panel)
	caption_label = _label("", 9)
	caption_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	caption_panel = _bottom_panel(caption_label, -12)
	add_child(caption_panel)
	toast_label = _label("", 8)
	toast_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	toast_panel = PanelContainer.new()
	toast_panel.add_theme_stylebox_override("panel", _box(Color(0.106, 0.102, 0.141, 0.92), Color.WHITE))
	toast_panel.anchor_left = 0.5
	toast_panel.anchor_right = 0.5
	toast_panel.grow_horizontal = Control.GROW_DIRECTION_BOTH
	toast_panel.offset_top = 34
	toast_panel.mouse_filter = Control.MOUSE_FILTER_IGNORE
	toast_panel.add_child(toast_label)
	toast_panel.visible = false
	add_child(toast_panel)
	_build_dialog()
	_build_title()
	_build_finale()
	skip_btn = _button("SALTAR ▶▶", 8, false)
	skip_btn.position = Vector2(318, 8)
	skip_btn.focus_mode = Control.FOCUS_NONE
	skip_btn.visible = false
	skip_btn.pressed.connect(func() -> void:
		if Game.main.current and Game.main.current.has_method("skip"): Game.main.current.skip())
	add_child(skip_btn)
	fade = ColorRect.new()
	fade.color = Color(0, 0, 0, 0)
	fade.size = Vector2(Game.VW, Game.VH)
	fade.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(fade)
	_build_touch()


func _build_dialog() -> void:
	dialog = PanelContainer.new()
	var sb := _box(Color("4b4f5c"), Color("20222b"), 3)
	sb.content_margin_left = 8
	sb.content_margin_right = 8
	sb.content_margin_top = 8
	sb.content_margin_bottom = 8
	dialog.add_theme_stylebox_override("panel", sb)
	dialog.position = Vector2(8, 8)
	dialog.custom_minimum_size = Vector2(384, 284)
	dialog.size = Vector2(384, 284)
	var vb := VBoxContainer.new()
	dialog.add_child(vb)
	var hb := HBoxContainer.new()
	hb.add_theme_constant_override("separation", 8)
	hb.size_flags_vertical = Control.SIZE_EXPAND_FILL
	vb.add_child(hb)
	d_img_panel = PanelContainer.new()
	d_img_panel.custom_minimum_size = Vector2(136, 136)
	d_img_panel.size_flags_vertical = Control.SIZE_SHRINK_BEGIN
	d_img_panel.add_theme_stylebox_override("panel", _box(Color.BLACK, Color("b8863b"), 3))
	d_img = TextureRect.new()
	d_img.expand_mode = TextureRect.EXPAND_IGNORE_SIZE
	d_img.stretch_mode = TextureRect.STRETCH_KEEP_ASPECT_CENTERED
	d_img.texture_filter = CanvasItem.TEXTURE_FILTER_LINEAR
	d_img_panel.add_child(d_img)
	d_ph = _label("", 7, Color("99aaaa"))
	d_ph.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	d_ph.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	d_ph.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	d_img_panel.add_child(d_ph)
	hb.add_child(d_img_panel)
	var right := VBoxContainer.new()
	right.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	right.size_flags_vertical = Control.SIZE_EXPAND_FILL
	right.add_theme_constant_override("separation", 3)
	hb.add_child(right)
	d_badge = _label("EN EXHIBICIÓN", 7)
	d_badge.size_flags_horizontal = Control.SIZE_SHRINK_BEGIN
	right.add_child(d_badge)
	d_title = _label("", 11, GOLD)
	d_title.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	d_title.custom_minimum_size = Vector2(200, 0)
	right.add_child(d_title)
	d_origin = _label("", 8, Color("9fd3ff"))
	right.add_child(d_origin)
	var sc := ScrollContainer.new()
	sc.size_flags_vertical = Control.SIZE_EXPAND_FILL
	sc.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	right.add_child(sc)
	d_desc = _label("", 9)
	d_desc.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	d_desc.custom_minimum_size = Vector2(196, 0)
	d_desc.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	sc.add_child(d_desc)
	d_close = _button("CERRAR (B)")
	d_close.focus_mode = Control.FOCUS_NONE
	d_close.size_flags_horizontal = Control.SIZE_SHRINK_END
	d_close.pressed.connect(close_dialog)
	vb.add_child(d_close)
	dialog.visible = false
	add_child(dialog)


func _build_title() -> void:
	title_root = Control.new()
	title_root.size = Vector2(Game.VW, Game.VH)
	var bg := ColorRect.new()
	bg.color = Color(0.02, 0.05, 0.1, 0.62)
	bg.size = Vector2(Game.VW, Game.VH)
	title_root.add_child(bg)
	var cc := CenterContainer.new()
	cc.size = Vector2(Game.VW, Game.VH)
	title_root.add_child(cc)
	var vb := VBoxContainer.new()
	vb.add_theme_constant_override("separation", 6)
	vb.alignment = BoxContainer.ALIGNMENT_CENTER
	cc.add_child(vb)
	t_title = _label("", 20, GOLD)
	t_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	t_title.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	t_title.custom_minimum_size = Vector2(360, 0)
	t_title.add_theme_color_override("font_outline_color", Color.BLACK)
	t_title.add_theme_constant_override("outline_size", 4)
	vb.add_child(t_title)
	t_sub = _label("", 10, Color("e9f3ff"))
	t_sub.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	t_sub.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	t_sub.custom_minimum_size = Vector2(340, 0)
	vb.add_child(t_sub)
	var hb := HBoxContainer.new()
	hb.alignment = BoxContainer.ALIGNMENT_CENTER
	hb.add_theme_constant_override("separation", 8)
	t_play = _button("ZARPAR", 11)
	t_play.pressed.connect(_on_play)
	hb.add_child(t_play)
	t_new = _button("NUEVO JUEGO", 11, false)
	t_new.pressed.connect(_on_new)
	hb.add_child(t_new)
	vb.add_child(hb)
	var help := _label("Mover: flechas / WASD o joystick\nAcción: Espacio / Enter / E o botón A\nCerrar: Esc / B o botón B", 8, Color("cfe0f5"))
	help.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	vb.add_child(help)
	title_root.visible = false
	add_child(title_root)


func _build_finale() -> void:
	finale_root = Control.new()
	finale_root.size = Vector2(Game.VW, Game.VH)
	var bg := ColorRect.new()
	bg.color = Color(0.02, 0.04, 0.09, 0.74)
	bg.size = Vector2(Game.VW, Game.VH)
	finale_root.add_child(bg)
	var cc := CenterContainer.new()
	cc.size = Vector2(Game.VW, Game.VH)
	finale_root.add_child(cc)
	var vb := VBoxContainer.new()
	vb.add_theme_constant_override("separation", 10)
	cc.add_child(vb)
	f_title = _label("", 16, GOLD)
	f_title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	f_title.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	f_title.custom_minimum_size = Vector2(340, 0)
	vb.add_child(f_title)
	f_text = _label("", 10)
	f_text.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	f_text.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	f_text.custom_minimum_size = Vector2(320, 0)
	vb.add_child(f_text)
	var b := _button("SEGUIR NAVEGANDO", 11)
	b.pressed.connect(func() -> void:
		finale_root.visible = false
		Game.blocked = false
		Game.consume()
		Game.main.go("sea", {"from": Game.SKULL_I}))
	var hb := HBoxContainer.new()
	hb.alignment = BoxContainer.ALIGNMENT_CENTER
	hb.add_child(b)
	vb.add_child(hb)
	finale_root.visible = false
	add_child(finale_root)


func _build_touch() -> void:
	if not DisplayServer.is_touchscreen_available(): return
	var j := Node2D.new()
	j.set_script(load("res://scripts/joystick.gd"))
	add_child(j)
	var a := TouchScreenButton.new()
	a.texture_normal = Game.tex("res://assets/ui/btn_a.png")
	a.action = "accion"
	a.position = Vector2(340, 232)
	add_child(a)
	var b := TouchScreenButton.new()
	b.texture_normal = Game.tex("res://assets/ui/btn_b.png")
	b.action = "atras"
	b.position = Vector2(294, 252)
	add_child(b)


# ---------------------------------------------------------------- API
func _process(delta: float) -> void:
	if toast_timer > 0.0:
		toast_timer -= delta
		if toast_timer <= 0.0: toast_panel.visible = false
	for p in _pending:
		p["d"] -= delta
	for p in _pending.duplicate():
		if p["d"] <= 0.0:
			_pending.erase(p)
			toast(p["t"], p["s"])
	if Game.dialog_open and (Game.action_pressed() or Game.back_pressed()):
		close_dialog()


func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventKey and event.pressed and not event.echo and event.keycode == KEY_M:
		Game.muted = not Game.muted


func show_hud(v: bool) -> void:
	hud.visible = v


func update_hud() -> void:
	hud_count.text = "%d/%d" % [Game.explored_count(), Game.N_ISL]


func set_place(s: String) -> void:
	hud_place.text = s


func set_prompt(s: String) -> void:
	if prompt_label.text != s: prompt_label.text = s
	prompt_panel.visible = s != ""


func set_caption(s: String) -> void:
	caption_label.text = s
	caption_panel.visible = s != ""


func toast(s: String, secs: float = 2.6) -> void:
	toast_label.text = s
	toast_panel.visible = true
	toast_timer = secs


func toast_after(s: String, delay: float, secs: float = 2.6) -> void:
	_pending.append({"t": s, "d": delay, "s": secs})


func show_skip(v: bool) -> void:
	skip_btn.visible = v


func open_dialog(o: Dictionary, cb: Callable = Callable()) -> void:
	d_title.text = o.get("titulo", "") if o.get("titulo", "") != "" else "Sin título"
	var rem: bool = o.get("removida", false)
	d_badge.text = "OBRA REMOVIDA" if rem else "EN EXHIBICIÓN"
	var bs := _box(Color("b3302a") if rem else Color("2f8f4e"), Color.BLACK, 1)
	d_badge.add_theme_stylebox_override("normal", bs)
	d_origin.text = o.get("origen", "")
	d_origin.visible = o.get("origen", "") != ""
	d_desc.text = o.get("descripcion", "") if o.get("descripcion", "") != "" else "Sin descripción."
	d_img.texture = null
	d_ph.text = ""
	if rem:
		d_ph.text = "OBRA REMOVIDA\n\nNo hay imagen disponible"
		d_ph.add_theme_color_override("font_color", Color("dd7777"))
		d_img_panel.add_theme_stylebox_override("panel", _box(Color("0a0a0a"), Color("888888"), 3))
	else:
		d_ph.add_theme_color_override("font_color", Color("99aaaa"))
		d_img_panel.add_theme_stylebox_override("panel", _box(Color.BLACK, Color("b8863b"), 3))
		if o.get("tex") != null:
			d_img.texture = o["tex"]
		elif o.get("imagen", "") != "":
			d_ph.text = "No se encontró la imagen:\n" + str(o["imagen"])
		else:
			d_ph.text = "Sin imagen.\nAgrega la ruta en museo.json"
	_hud_was = hud.visible
	hud.visible = false
	dialog.visible = true
	Game.dialog_open = true
	Game.consume()
	d_cb = cb
	Game.play("open")


func close_dialog() -> void:
	if not Game.dialog_open: return
	Game.dialog_open = false
	Game.consume()
	dialog.visible = false
	hud.visible = _hud_was
	Game.play("close")
	var cb := d_cb
	d_cb = Callable()
	if cb.is_valid(): cb.call()


func show_title() -> void:
	t_title.text = str(Game.museo.get("titulo", "ISLAS DE LA CONTRARREVOLUCIÓN"))
	t_sub.text = str(Game.museo.get("subtitulo", ""))
	t_play.text = "CONTINUAR" if Game.has_progress() else "ZARPAR"
	t_new.visible = Game.has_progress()
	t_new.text = "NUEVO JUEGO"
	new_armed = false
	title_root.visible = true
	Game.blocked = true
	t_play.grab_focus()


func _on_play() -> void:
	_start(false)


func _on_new() -> void:
	if not new_armed:
		new_armed = true
		t_new.text = "¿SEGURO? BORRA TODO"
		return
	_start(true)


func _start(fresh: bool) -> void:
	if fresh: Game.reset_save()
	title_root.visible = false
	Game.blocked = false
	Game.consume()
	Game.main.go("sea", {})


func show_finale() -> void:
	f_title.text = Game.txt["finalTitulo"]
	f_text.text = Game.txt["finalTexto"]
	finale_root.visible = true
	Game.blocked = true
