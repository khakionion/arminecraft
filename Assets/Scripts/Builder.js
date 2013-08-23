var Block : Transform;
var baseTransform : Transform;
var blockCount : float = 4.0f;
var removeBlock: Transform;

private var textures = new Array();
private var palettes = {};
private var selectedPaletteIndex: int = 0;

function Start(){
	textures = Resources.LoadAll("Textures", Texture);
	
	this.palettes[-1] = removeBlock;
	for (var i = 0; i < textures.length; i++) {
	
		var newBlock : Transform = Instantiate(Block, Vector3.zero, Quaternion.identity);
		newBlock.renderer.material.mainTexture = textures[i];
		newBlock.tag = "Block";
		newBlock.parent = this.camera.transform;
		newBlock.localPosition = new Vector3(-3 + 1.5f * i, -4, 15);
		newBlock.localScale = Vector3.one;
		newBlock.tag = 'Palette';
		newBlock.gameObject.AddComponent('Palette');
		var component: Palette = newBlock.gameObject.GetComponent('Palette') as Palette;
		component.SetIndex(i);
		this.palettes[i] = newBlock;
	}
	
	this.SelectPalette(0);
}

function Update () {
	if(!Input.GetMouseButtonDown(0)){
		return;
	}
	var ray : Ray = this.camera.ScreenPointToRay(Input.mousePosition);
	var hit : RaycastHit;

	if (Physics.Raycast(ray, hit, 1000) ) {
		if (hit.transform.tag == "Block" || hit.transform.tag == "Terrain") {
			if(this.selectedPaletteIndex == -1){
				if(hit.transform.tag == "Block"){
					Destroy(hit.collider.gameObject);
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
				newBlock.parent = baseTransform;
				newBlock.transform.localScale = Vector3.one / blockCount;
			}
		}

		if (hit.transform.tag == "Palette") {
			var palette: Palette = hit.collider.transform.GetComponent('Palette') as Palette;
			this.SelectPalette(palette.GetIndex());
		}
		
		if (hit.transform.tag == "Reset") {
			var objects = GameObject.FindGameObjectsWithTag("Block");
			for (var i = 0; i < objects.length; i++) {
				Destroy(objects[i]);
			}
		}
	}
}

function GetPalette(i: int): Palette {
	var block: Transform = this.palettes[i] as Transform;
	var palette: Palette = block.gameObject.GetComponent('Palette') as Palette;
	return palette;
}

function SelectPalette(index: int) {
	var selectedPalette = this.GetPalette(index);
	if (selectedPalette.IsSelected()) {
		return;
	}
		
	for (var entry in palettes) {
		var palette = this.GetPalette(entry.Key);
		palette.Reset();
	}

	selectedPalette.Select();
	this.selectedPaletteIndex = index;
}