import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public title = 'HawkEye';
  public selectedFile: File = null;
  constructor(private http: HttpClient) { }

  public photoClicked = false;

  public elevation = '--';
  public showWebcam = true;
  public allowCameraSwitch = true;
  public multipleWebcamsAvailable = false;
  public camImage = null;
  public videoOptions: MediaTrackConstraints = {};

  public errors: WebcamInitError[] = [];
  public deviceId: string;
  public webcamImage: WebcamImage = null;

  public imagePath;
  public imgURL: any;
  public message: string;

  public trigger: Subject<void> = new Subject<void>();
  private nextWebcam: Subject<boolean | string> = new Subject<boolean | string>();

  public height: number;
  public width: number;

  public ngOnInit(): void {
    WebcamUtil.getAvailableVideoInputs()
      .then((mediaDevices: MediaDeviceInfo[]) => {
        this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
      });
    window.addEventListener('beforeinstallprompt', event => {
      // this.promptEvent = event;
    });

    this.height = window.innerHeight;
    this.width = window.innerWidth;

  }

  preview(files) {
    if (files.length === 0) {
      return;
    }

    const mimeType = files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      this.message = 'Only images are supported.';
      return;
    }

    const reader = new FileReader();
    this.imagePath = files;
    reader.readAsDataURL(files[0]);
    this.selectedFile = files[0];

    reader.onload = (event) => {
      this.imgURL = reader.result;
      this.camImage = this.imgURL;
      this.photoClicked = true;
    };
  }

  public triggerSnapshot(): void {
    this.trigger.next();
    console.log(this.webcamImage);
    this.selectedFile = <File>this.dataURItoBlob(this.webcamImage.imageAsDataUrl);
    this.camImage = this.webcamImage.imageAsDataUrl;
    this.photoClicked = true;
  }

  public reset() {
    this.photoClicked = false;
  }

  public dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  public toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
  }

  public handleInitError(error: WebcamInitError): void {
    this.errors.push(error);
  }

  public showNextWebcam(directionOrDeviceId: boolean | string): void {
    this.nextWebcam.next(directionOrDeviceId);
  }

  public handleImage(webcamImage: WebcamImage): void {
    console.log('received webcam image', webcamImage);
    this.webcamImage = webcamImage;
  }

  public cameraWasSwitched(deviceId: string): void {
    console.log('active device: ' + deviceId);
    this.deviceId = deviceId;
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public get nextWebcamObservable(): Observable<boolean | string> {
    return this.nextWebcam.asObservable();
  }

  onUpload() {
    const fd = new FormData();
    console.log(this.selectedFile);

    fd.append('image', this.selectedFile);
    console.log(fd);
    this.elevation = '--';
    this.http.post('http://jarvis.somecha.in:9002/handle_data', fd, {
      reportProgress: true,
      observe: 'events'
    })
      .subscribe(event => {
        if (event.type === HttpEventType.UploadProgress) {
          console.log('Upload Progress: ' + Math.round(event.loaded / event.total * 100) + '%')
        } else if (event.type === HttpEventType.Response) {
          console.log(event.body);
          const base64img = event.body['img'].toString().split('\n').join('');
          this.elevation = event.body['elevation'];
          this.camImage = 'data:Image/png;base64,' + base64img;
          this.webcamImage = this.camImage;
        }
      }
      );
    this.selectedFile = null;

  }
}
