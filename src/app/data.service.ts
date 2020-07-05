import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { Router } from '@angular/router';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  i = 0;
  userdatas: any = [];
  assesments: any = [];
  assesment1: any = [];
  constructor(private afAuth: AngularFireAuth, private db: AngularFireDatabase, private router: Router) { 
    this.db.list('/UserTable').snapshotChanges()
    .subscribe(user => {
      user.map(data => {
        this.userdatas.push({ id: data.key, value: data.payload.val() });
      });
    });

    this.db.list('/Assesment1').snapshotChanges().subscribe(ques => {
      let oFlag = 0;
      let eFlag = 0;
      let shuffle = moment().format("mm:ss");
      console.log("shuffle: ", shuffle);
      ques.map(data => {
          this.assesments.push({ data: data.payload.val() });       
      });
      (Number(shuffle.split(':')[0]) % 2 === 0)? ++eFlag : ++oFlag;
      (Number(shuffle.split(':')[1]) % 2 === 0)? ++eFlag : ++oFlag;
      if( eFlag > oFlag) {
        this.eloop(ques);
        this.oloop(ques);
        } 
        else if ( oFlag > eFlag) {
          this.oloop(ques);
          this.eloop(ques);
        } else {
          this.oeloop(ques);
        }
    })
   }
   
   eloop(ques) {
    for( let j = 0; j < ques.length; j++) { 
      if( j % 2 === 0) {
        this.assesment1.push({  index: ++this.i,assesment1: this.assesments[j]['data']});
      }
    }
   }
   
   oloop(ques) {
    for( let j = 0; j < ques.length; j++) { 
      if( j % 2 !== 0) {
        this.assesment1.push({  index: ++this.i,assesment1: this.assesments[j]['data']});
      }
    }
   }

   oeloop(ques) {
    for( let j = 0; j < ques.length; j++) { 
      if((j % 3 === 0)) {
        this.assesment1.push({  index: ++this.i,assesment1: this.assesments[j]['data']});
      }
    }
    for( let j = 0; j < ques.length; j++) { 
      if((j % 3 !== 0)) {
        this.assesment1.push({  index: ++this.i,assesment1: this.assesments[j]['data']});
      }
    }
   }


  getData(id?) {
    return this.userdatas;
  }

  getAssesment1() {
    return this.assesment1;
  }
  loginAuth(id) {
    this.userdatas.find( user => { 
      if(user.value['account']['userid'] === id) {
        if(user.value['account']['role'] === "admin") {
          localStorage.setItem('DomainAdmin', id);
        } else {
          localStorage.setItem('DomainUser', id);
        }
        this.router.navigate(['/main']);
      }
    });
  }
}
