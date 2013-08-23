#pragma strict

var startSelected: boolean = false;
var maxScale: float = 2.0f;
var colorStart = new Color(128, 128, 128);
var colorEnd = new Color(200, 128, 128);
var sparkParticleSystem: ParticleSystem;

function Select () {
	sparkParticleSystem.Play();
	startSelected = true;
}

function Reset() {
	sparkParticleSystem.Stop();
	startSelected = false;
	this.transform.localScale = Vector3.one;
	renderer.material.SetColor("_EmisColor", colorStart);
}

function IsSelected () {
	return  startSelected;
}

function IsFullSelected() {
	var t = this.transform.localScale.x;
	return (t >= maxScale);
}

function Update () {
	if (startSelected) {
		var t = this.transform.localScale.x;
		t += Time.deltaTime * (maxScale - 1);
		
		var lerp = (t - 1) / (maxScale - 1);
		var color = Color.Lerp(colorStart, colorEnd, lerp);
		renderer.material.SetColor("_EmisColor", color);
		
		if (t > maxScale) {
			t = maxScale;
		}
		
		this.transform.localScale = new Vector3(t, t, t);
	}
}