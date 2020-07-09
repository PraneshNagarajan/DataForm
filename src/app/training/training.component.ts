import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { AngularFireAuth } from 'angularfire2/auth';
import { Router } from '@angular/router';
import { DataService } from '../data.service';
import { AngularFireDatabase } from 'angularfire2/database';
@Component({
  selector: 'app-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.css']
})
export class TrainingComponent implements OnInit {
  media: Subscription;
  top;
  bottom;
  deviceXs;
  deviceSm;
  deviceMd;
  deviceLg;
  deviceWidth;
  deviceHeight;
  next:boolean;
  back: boolean;
  dbsize;
  size;
  plist = 1;
  videoList = [];

  constructor(private mediaObserver: MediaObserver, private afAuth: AngularFireAuth, private router: Router, private service: DataService, private db: AngularFireDatabase) {
    this.db.list('/VideoTraining').snapshotChanges().subscribe(video => {
      let i = 0;
      video.map( list => {
        this.videoList.push({id : ++i, playlist: list.payload.val()});
      });
    });
   }

  ngOnInit() {
    this.media = this.mediaObserver.media$.subscribe( (change: MediaChange) => {
      if(change.mqAlias === 'xs') {
        this.deviceXs = true;
        this.deviceHeight = 200;
        this.deviceWidth = 240;
        this.size = 90;
        this.top="50%"
        this.bottom="100%"
      } 
      else if(change.mqAlias === 'sm') {
        this.deviceXs = false;
        this.deviceSm = true;
        this.size = 90;
        this.deviceHeight = 300;
        this.deviceWidth = 440;
        this.size = 90;
        this.top="50%"
        this.bottom="100%"
      }
      else if (change.mqAlias === 'md') {
        this.deviceMd = true;
        this.deviceHeight = 440;
        this.deviceWidth = 650;
        this.size = 80;
        this.top="10%"
        this.bottom="100%"
      }
      else {
        this.deviceLg = true;
        this.deviceHeight = 450;
        this.deviceWidth = 1050;
        this.size = 80;
        this.top="10%"
        this.bottom="100%"
      }
      //this.deviceXs = (change.mqAlias === 'xs') ? true: false;
      //this.deviceWidth = (this.deviceXs)? 300: 880;
      //this.deviceHeight = (this.deviceXs)? 100: 400;

    });
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);
  }

onNext() {
  this.dbsize = this.videoList.length;
  ++this.plist;
  if(this.plist === this.dbsize) {
     this.next = true;
  } else {
    this.next = false;
  }
  this.back = true;
}

onBack() {
  --this.plist;
  if(this.plist  > 1) {
  this.back =  true;
  } else {
    this.back = false;
  }
  this.next = false;
}
  signOut() {
    this.service.logOut();
  }

}