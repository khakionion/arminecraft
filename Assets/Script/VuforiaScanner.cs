using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using System;
using System.Linq;
using com.google.zxing.qrcode;
using com.google.zxing.multi;
using com.google.zxing.common;
using com.google.zxing;
using com.google.zxing.client.result;
 
[AddComponentMenu("System/VuforiaScanner")]
public class VuforiaScanner : MonoBehaviour
{
    public QCARBehaviour vuforia;
    public bool barcode;
    public GameObject target;
 
    public static event Action<ParsedResult, string> Scanned = delegate {};
    public static event Action<string> ScannedQRCode = delegate {};
    public static event Action<string> ScannedBarCode = delegate {};
 
    bool decoding;
    bool initGray;
    MultiFormatReader mfReader = new MultiFormatReader();
    QRCodeReader qrReader = new QRCodeReader();
 
    void Update()
    {
        if(vuforia == null)
            return;
        if(vuforia.enabled && !initGray)
        {
                     //Wait 1/4 seconds for the device to initialize (otherwise it seems to crash sometimes)
             initGray = true;
             Loom.QueueOnMainThread(()=>{
                          initGray = CameraDevice.Instance.SetFrameFormat(Image.PIXEL_FORMAT.GRAYSCALE, true);
             }, 0.25f);
        }
        if (vuforia.enabled && CameraDevice.Instance != null && !decoding)
        {
            var image = CameraDevice.Instance.GetCameraImage(Image.PIXEL_FORMAT.GRAYSCALE);
            if (image != null)
            {
                decoding = true;
 
                Loom.RunAsync(() =>
                {
                    try
                    {
                        var bitmap = new BinaryBitmap(new HybridBinarizer(new RGBLuminanceSource(image.Pixels, image.BufferWidth, image.BufferHeight, true)));
                        Result data;
                        if (barcode)
                        {
                            var reader = new MultiFormatReader();
                            data = reader.decode(bitmap);
                        }
                        else
                        {
                            var reader = new QRCodeReader();
                            data = reader.decode(bitmap);
                        }
                        if (data != null)
                        {
                            Loom.QueueOnMainThread(() => {
                                if (data.BarcodeFormat == BarcodeFormat.QR_CODE)
                                {
                                    ScannedQRCode(data.Text);
                                    if(target != null)
                                    {
                                        target.SendMessage("ScannedQRCode", data.Text, SendMessageOptions.DontRequireReceiver);
                                    }
                                }
                                if (data.BarcodeFormat != BarcodeFormat.QR_CODE)
                                {
                                    ScannedBarCode(data.Text);
                                    if(target != null)
                                    {
                                        target.SendMessage("ScannedBarCode", data.Text, SendMessageOptions.DontRequireReceiver);
                                    }
 
                                }
                                var parsedResult = ResultParser.parseResult(data);
                                if(target != null)
                                {
                                    target.SendMessage("Scanned", parsedResult, SendMessageOptions.DontRequireReceiver);
                                }
                                Scanned(parsedResult, data.Text);
                                decoding = false;
                            });
                        }
                    }
                    catch (Exception e)
                    {
                        decoding = false;
                    }
                });
 
            }
 
        }
    }
 
}