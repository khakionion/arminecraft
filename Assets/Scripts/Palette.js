var index: int;
var isSelected: boolean;
var roationSpeed: float = 50.0f;
var isPlane: boolean = false;

function Update() {
	if (this.isSelected) {
		if (isPlane) {
			this.transform.Rotate(new Vector3(0, roationSpeed * Time.deltaTime, 0));
		} else {
			this.transform.Rotate(new Vector3(roationSpeed * Time.deltaTime, roationSpeed * Time.deltaTime, 0));
		}
	}
}

function SetIndex(index: int) {
	this.index = index;
}

function GetIndex(): int {
	return this.index;
}

function Select() {
	this.isSelected = true;
}

function Reset() {
	this.isSelected = false;
	this.transform.localEulerAngles = Vector3.zero;
}

function IsSelected(): boolean {
	return this.isSelected;
}

