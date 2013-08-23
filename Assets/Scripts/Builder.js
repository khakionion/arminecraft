var Block : Transform;
var textureIndicator : GUITexture;
var baseTransform : Transform;
var blockCount : float = 4.0f;

private var textures = new Array();
private var selectedTexture : int;


function Start(){
	textures = Resources.LoadAll("Textures", Texture);
}

function Update () {

	if(Input.GetKeyDown(KeyCode.E) && selectedTexture < textures.length-1){
		selectedTexture++;
	}
	else if(Input.GetKeyDown(KeyCode.Q) && selectedTexture > 0){
		selectedTexture--;
	}
		
	textureIndicator.texture = textures[selectedTexture];

	if(Input.GetMouseButtonDown(0) || Input.GetMouseButtonDown(1)){
		var ray : Ray = this.camera.ScreenPointToRay(Input.mousePosition);
		var hit : RaycastHit;

		if(Physics.Raycast(ray,hit, 1000) && (hit.transform.tag == "Block" || hit.transform.tag == "Terrain"))
		{
			
			if(Input.GetMouseButtonDown(0)){
				var buildPos : Vector3;
				Debug.Log("set");
				if(hit.transform.tag == "Block"){
					buildPos = hit.collider.transform.position + hit.normal.normalized / blockCount;
				}
				else{
					var point: Vector3 = hit.point;
					buildPos = Vector3(Mathf.Round(point.x * blockCount) / blockCount, (Mathf.Ceil(point.y * blockCount) / blockCount) / 2, Mathf.Round(point.z * blockCount) / blockCount);
					Debug.Log(point + " : " + buildPos);
				}
	
				var newBlock : Transform = Instantiate(Block, buildPos, Quaternion.identity);
				newBlock.renderer.material.mainTexture = textures[selectedTexture];
				newBlock.tag = "Block";
				newBlock.parent = baseTransform;
				newBlock.transform.localScale = Vector3.one / blockCount;
			}
			else if(hit.transform.tag == "Block"){
				Destroy(hit.transform.gameObject);
			}
		}
	}
}