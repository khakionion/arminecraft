using UnityEngine;
using System.Collections;
using com.google.zxing.client.result;

public class QRScanHandler : MonoBehaviour {
	void ScannedQRCode () {
	}
	
	void Scanned(ParsedResult result) {
		this.guiText.text = result.ToString();
	}
}
