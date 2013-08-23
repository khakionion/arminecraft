var Block : Transform;
var baseTransform : Transform;
var paletteTransform: Transform;
var sliderTransform: Transform;
var blockCount : float = 4.0f;
var removeBlock: Transform;
var resetButton: ResetButton;
var uiCamera: Camera;
var destroyWait: float = 2.0f;
var explosionPower: float = 2000;

var soundPut: AudioClip;
var soundDig: AudioClip;
var soundReset: AudioClip;
var soundPalette: AudioClip;
var reqPressTime = 0.3f;
private var textures = new Array();
private var palettes = {};
private var selectedPaletteIndex: int = 0;
private var pressedTime: float;
private var pressStarted: boolean = false;
private var prevPosX = 0; 

function Start(){
	textures = Resources.LoadAll("Textures", Texture);

	this.palettes[-1] = removeBlock;
	for (var i = 0; i < textures.length; i++) {
	
		var newBlock : Transform = Instantiate(Block, Vector3.zero, Quaternion.identity);
		Destroy(newBlock.gameObject.GetComponent('Rigidbody'));
		newBlock.renderer.material.mainTexture = textures[i];
		newBlock.tag = "Block";
		newBlock.parent = sliderTransform;
		newBlock.localPosition = new Vector3(-3 + 1.5f * i, -4, 15);
		newBlock.localScale = Vector3.one;
		newBlock.tag = 'Palette';
		newBlock.gameObject.layer = 8;
		newBlock.gameObject.AddComponent('Palette');
		var component: Palette = newBlock.gameObject.GetComponent('Palette') as Palette;
		component.SetIndex(i);
		this.palettes[i] = newBlock;
	}
	
	this.SelectPalette(0);
	
	Screen.autorotateToPortraitUpsideDown = true;
	Screen.autorotateToPortrait = true;
	Screen.autorotateToLandscapeLeft = true;
	Screen.autorotateToLandscapeRight = true;
	Screen.orientation = ScreenOrientation.AutoRotation;
}

function Explode() {
	var objects = GameObject.FindGameObjectsWithTag("Block");
	for (var i = 0; i < objects.length; i++) {
		var object:GameObject = objects[i];
		object.rigidbody.useGravity = true;
		var power = explosionPower;
		object.rigidbody.AddForce(new Vector3(power * (Random.value - 0.5f), power *  (Random.value - 0.5f), power  * (Random.value - 0.5f)));

		WaitAndDestroy(objects[i]);
	}
	audio.PlayOneShot(soundReset);
	resetButton.gameObject.SetActive(false);
}


function updateOrientation() {
	camera.ResetAspect();
	paletteTransform.localPosition = new Vector3(-7.2 * this.camera.aspect + 3.7, -2.5, 1.2);
}

function uiSelect() {  
	var resetButtonPressed = false;
	var ray; 
	var hit: RaycastHit;
	ray = this.uiCamera.ScreenPointToRay(Input.mousePosition);
	if (Physics.Raycast(ray, hit, 1000) ) { 
		if (hit.transform.tag == "Palette") {
			var palette: Palette = hit.collider.transform.GetComponent('Palette') as Palette;
			if (this.SelectPalette(palette.GetIndex())) {
				audio.PlayOneShot(soundPalette); 
			}
		}
	
		if (hit.transform.tag == "Reset") { 
			resetButtonPressed = true;
		}
	}
	
	if (resetButtonPressed) {
		if(!resetButton.IsSelected()) {
			resetButton.Select();
		}
	} else {
		resetButton.Reset();
	}
}

function Update () { 
	if (pressStarted) { 
		var delta = Input.mousePosition.x - prevPosX;
		prevPosX = Input.mousePosition.x; 
		if (Mathf.Abs(delta) > 10) {
			 pressedTime = 0;
		}  
		if (Mathf.Abs(delta) > 1) {
			var pos = sliderTransform.localPosition;
			var newX = pos.x + delta / 30.0f; 
			if (newX > 0) {
				newX = 0;
			}
			
			sliderTransform.localPosition = new Vector3(newX, pos.y, pos.z); 
		}
		Debug.Log(delta);
		pressedTime += Time.deltaTime;
		if (pressedTime > reqPressTime) {
			uiSelect();  
			pressedTime = 0;
			pressStarted = false;
		} 
	}

	updateOrientation();
	if (resetButton.IsFullSelected()) {
		Explode();
		resetButton.Reset();
	}
	
	if (Input.GetMouseButtonUp(0)) {
		pressedTime = 0; 
		pressStarted = false;
		if (resetButton.IsSelected()) {
			resetButton.Reset();
		}
		
		return;
	}
	
	if(!Input.GetMouseButtonDown(0)){
		return;
	}
   
    // Start pressing
  	pressStarted = true; 
  	pressedTime = 0; 
  	prevPosX = Input.mousePosition.x;
 
 	// UI 
	var ray; 
	var hit: RaycastHit;

	// Camera 
	ray = this.camera.ScreenPointToRay(Input.mousePosition);
	if (Physics.Raycast(ray, hit, 1000) ) {
		if (hit.transform.tag == "Block" || hit.transform.tag == "Terrain") {
			if(this.selectedPaletteIndex == -1){
				if(hit.transform.tag == "Block"){
					Destroy(hit.collider.gameObject);
					audio.PlayOneShot(soundDig);
				}
			} else {
				var buildPos : Vector3;
				if(hit.transform.tag == "Block"){
					buildPos = hit.collider.transform.position + hit.normal.normalized / blockCount;
				}
				else{
					var point: Vector3 = hit.point;
					buildPos = Vector3(Mathf.Round(point.x * blockCount) / blockCount, (Mathf.Ceil(point.y * blockCount) / blockCount) / 2, Mathf.Round(point.z * blockCount) / blockCount);;
				}

				var newBlock : Transform = Instantiate(Block, buildPos, Quaternion.identity);
				newBlock.renderer.material.mainTexture = textures[this.selectedPaletteIndex];
				newBlock.tag = "Block";
				newBlock.parent = this.baseTransform;
				newBlock.transform.localScale = Vector3.one / blockCount;
				
				audio.PlayOneShot(soundPut);
				resetButton.gameObject.active = true;
			}
		}
	}
	

}

function WaitAndDestroy(gameObject){
   yield WaitForSeconds(destroyWait);
   Destroy(gameObject);
}

function GetPalette(i: int): Palette {
	var block: Transform = this.palettes[i] as Transform;
	var palette: Palette = block.gameObject.GetComponent('Palette') as Palette;
	return palette;
}

function SelectPalette(index: int) {
	var selectedPalette = this.GetPalette(index);
	if (selectedPalette.IsSelected()) { 
		return false;
	}
		
	for (var entry in palettes) {
		var palette = this.GetPalette(entry.Key);
		palette.Reset();
	}

	selectedPalette.Select();
	this.selectedPaletteIndex = index; 
	return true;
}