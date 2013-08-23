using UnityEngine;
using System.Collections;

public class WWWTest : MonoBehaviour {

	// Use this for initialization
	void Start () {
	
	}
	
	// Update is called once per frame
	void Update () {
	
	}
	
    void OnGUI()
    {
        if(GUI.Button(new Rect(10, 10, 100, 30), "Start"))
        {
			print ("Start");
			 StartCoroutine("callRemote");
        }
        if(GUI.Button(new Rect(10, 50, 100, 30), "Stop"))
        {
			print ("Stop");
        }
	}
	
	IEnumerator callRemote()
	{
		WWW www = new WWW("http://127.0.0.1:8888/ar_test/rest");
		yield return www;
	}
}
