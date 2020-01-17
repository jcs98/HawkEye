import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http'
// import { viewClassName } from '@angular/compiler';
// import 
// import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs';
import {WebcamImage, WebcamInitError, WebcamUtil} from 'ngx-webcam';
import { Subject } from 'rxjs';
import { saveAs} from "file-saver";
import { stringify } from 'querystring';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
      
      title = 'Scorpion-App';
      selectedFile: File = null;
      constructor ( private http: HttpClient) {}
  
      public showWebcam = true;
      public allowCameraSwitch = true;
      public multipleWebcamsAvailable = false;
      public camImage = null;
      public videoOptions: MediaTrackConstraints={

      };

      public errors: WebcamInitError[] =[];
      public deviceId: string;
      public webcamImage: WebcamImage = null;

      public trigger:Subject<void> = new Subject<void>();
      private nextWebcam: Subject<boolean|string> = new Subject<boolean|string>();

      public ngOnInit(): void {
        WebcamUtil.getAvailableVideoInputs()
          .then((mediaDevices: MediaDeviceInfo[]) => {
            this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
          });
      }
    
      public triggerSnapshot(): void {
        this.trigger.next();
        console.log(this.webcamImage)
        this.selectedFile = <File>this.dataURItoBlob(this.webcamImage.imageAsDataUrl);
        this.camImage = this.webcamImage.imageAsDataUrl;
        // document.getElementsByTagName('img')[0].toDataURL();

      }


      //////////////////////////
      public dataURItoBlob(dataURI) {
        // convert base64 to raw binary data held in a string
        // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
        var byteString = atob(dataURI.split(',')[1]);
    
        // separate out the mime component
        var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    
        // write the bytes of the string to an ArrayBuffer
        var ab = new ArrayBuffer(byteString.length);
        var ia = new Uint8Array(ab);
        for (var i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], {type: mimeString});
    
    
    }
      /////////////
    
      public toggleWebcam(): void {
        this.showWebcam = !this.showWebcam;
      }
    
      public handleInitError(error: WebcamInitError): void {
        this.errors.push(error);
      }
    
      public showNextWebcam(directionOrDeviceId: boolean|string): void {
        // true => move forward through devices
        // false => move backwards through devices
        // string => move to device with given deviceId
        this.nextWebcam.next(directionOrDeviceId);
      }
    
      public handleImage(webcamImage: WebcamImage): void {
        console.info('received webcam image', webcamImage);
        this.webcamImage = webcamImage;
        
        // console.log(this.selectedFile)
      }
    
      public cameraWasSwitched(deviceId: string): void {
        console.log('active device: ' + deviceId);
        this.deviceId = deviceId;
      }
    
      public get triggerObservable(): Observable<void> {
        return this.trigger.asObservable();
      }
    
      public get nextWebcamObservable(): Observable<boolean|string> {
        return this.nextWebcam.asObservable();
      }
  

  

  onFileSelected(event) {
    this.camImage = false;
    this.selectedFile = <File>event.target.files[0];
    console.log(event)
    this.camImage = this.selectedFile.name
    console.log(this.selectedFile);

    console.log(btoa(this.selectedFile.toString()))
  }

  onUpload(){
    const fd = new FormData();
    console.log(this.selectedFile)
    
    fd.append('image', this.selectedFile)
    console.log(fd)
    this.http.post('http://192.168.43.204:8000/handle_data',fd, {
      reportProgress: true,
      observe: 'events'
    })
      .subscribe(event => {
        if(event.type === HttpEventType.UploadProgress){
          console.log('Upload Progress: ' + Math.round(event.loaded / event.total * 100)  + '%')
        }else if (event.type === HttpEventType.Response){
          console.log(event.body['msg']);
          const base64img = event.body['msg'].toString().split('\n').join('');
          // const base64img = "iVBORw0KGgoAAAANSUhEUgAAAoAAAAHgCAIAAAC6s0uzAAADk0lEQVR4nO3BAQEAAACCIP+vbkhAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwaBKyAAEKyjCgAAAAAElFTkSuQmCC" 
          this.camImage = "data:Image/png;base64,"+base64img
        }}
        )
    this.selectedFile = null

  }
}
