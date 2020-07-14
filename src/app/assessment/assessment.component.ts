import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase } from 'angularfire2/database';
import { Router } from '@angular/router';
import { DataService } from '../data.service';
import * as moment from 'moment';

@Component({
  selector: 'app-assessment',
  templateUrl: './assessment.component.html',
  styleUrls: ['./assessment.component.css']
})
export class AssessmentComponent implements OnInit, OnDestroy {
  color;
  Arole;
  crt;
  wrng;
  userName;
  duration;
  assessmentlist = [];
  userAnswered = [];
  dbsize;
  msg;
  timer;
  isConfirmed: boolean;
  isScheduled: boolean;
  countdown: boolean;
  isSpinner: boolean;
  isLate: boolean;
  isAvailable: boolean;
  assessmentDatas = [];
  quesDatas = [];
  device;
  top;
  loggedUser;
  childID = -1;
  tableID;
  Sname: string;
  Sdate: string;
  Stime: string;
  time = new Date();
  media: Subscription;
  DB: Subscription;
  roles = [
    { name: 'admin' },
    { name: 'user' }
  ];
  timer1: any;
  bottom: string;
  col: number;
  dbLength: any[];
  Loop = 0;
  options = [];
  constructor(private mediaObserver: MediaObserver, private afAuth: AngularFireAuth, private db: AngularFireDatabase, private router: Router, private service: DataService) {
    let j = -1;
    if (localStorage.getItem('DomainAdmin')) {
      this.loggedUser = localStorage.getItem('DomainAdmin');
    } else {
      this.loggedUser = localStorage.getItem('DomainUser')
    }
    this.DB = this.db.list('/AssessmentUserStatusTracker').snapshotChanges().subscribe((data) => {
      data.map(assessment => {
        this.assessmentlist.push(assessment.payload.val());
        this.ngOnDestroy();
        this.assessmentlist.map(list => {
          if(list['status'] === "Unstarted") {
          if (!this.isScheduled) {
            let users:any[] = [list['scheduleded_info']['users']];
            users.map( user => {
              ++j;
              if (user[j]['id'] === this.loggedUser) {
                if (user[j]['status'] !== "Unstarted") {
                  this.tableID = assessment.key;
                  this.childID = j;
                  this.Sname = list['scheduleded_info']['name'];
                  this.Sdate = (list['scheduleded_info']['date'] as string);
                  this.isScheduled = true;
                  let Cdate = moment(this.time).format("MM/DD/YYYY");
                  let Ctime = moment(this.time).format("MM/DD/YYYY HH:mm:ss");
                  this.Stime = list['scheduleded_info']['time'];
                  if (Cdate === this.Sdate) {
                    let interval = setInterval(() => {
                      this.time = new Date();
                      Ctime = moment(this.time).format("MM/DD/YYYY HH:mm:ss");
                      let Stime1 = this.Sdate + " " + this.Stime;
                      let Shour = Number(this.Stime.split(':')[0]);
                      let Smin = Number(this.Stime.split(':')[1]);
                      let Chour = Number(moment(this.time).format('HH'));
                      let Cmin = Number(moment(this.time).format('mm'));
                      if ((Chour > Shour) || ((Chour === Shour) && (Cmin > Smin))) {
                        let SchTime = moment.utc(moment(Ctime, "MM/DD/YYYY HH:mm:ss").diff(moment(Stime1, "MM/DD/YYYY HH:mm:ss"))).format("HH:mm:ss");
                        if (Number(SchTime.split(':')[1]) <= 20) {
                          let seconds = Number(SchTime.split(':')[1]) * 60 + Number(SchTime.split(':')[2]);
                          this.duration = list['scheduleded_info']['duration'] - seconds;
                          this.timer = this.duration;
                          this.isLate = true;
                          this.assessmentDatas = this.service.getAssessment(list['scheduleded_info']['name']); 
                          this.dbsize = this.assessmentDatas.length;
                          this.dbLength = Array(this.dbsize); 
                          clearInterval(interval);
                          if (confirm("Please Click 'OK' button to start Assessment.")) {
                            this.onUpdateStatus();
                          }
                        } else {
                          this.msg = "Assessment already started...."
                          this.isAvailable = true;
                          clearInterval(interval);
                        }
                      } else {
                        let SchTime = moment.utc(moment(Stime1, "MM/DD/YYYY HH:mm:ss").diff(moment(Ctime, "MM/DD/YYYY HH:mm:ss"))).format("HH:mm:ss");
                        if (Number(SchTime === "00:00:00")) {
                          this.assessmentDatas = this.service.getAssessment(list['scheduleded_info']['name']);
                          this.assessmentDatas.map(data => {
                            this.options.push(data['options']);
                          });
                          this.dbsize = this.assessmentDatas.length;
                          this.dbLength = Array(this.dbsize); 
                          this.timer1 = list['scheduleded_info']['duration'];
                          this.isAvailable = false;
                          clearInterval(interval);
                          if (confirm("Please Click 'OK' button to start Assessment.")) {
                            this.onUpdateStatus();
                          }
                        }
                        else {
                          this.msg = "Assessment will start on " + SchTime;
                          this.isAvailable = true;
                        }
                      }
                    }, 1000);
                  }
                }
                else {
                  alert("Already you have started Assessement.");
                  this.router.navigate(['/homePage']);
                }
              } else {
                this.msg = "No Assessment scheduled for you at this moment."
              }
            });
          }
        }
        });
      });
    });
    this.userName = localStorage.getItem('username');
  }


  ngOnInit() {
    this.media = this.mediaObserver.media$.subscribe( (change: MediaChange) => {
      if(change.mqAlias === 'xs') {
        this.col = 1
        this.top="50%"
        this.bottom="100%"
      } 
      else if(change.mqAlias === 'sm') {
        this.col = 1;
        this.top="50%"
        this.bottom="100%"
      }
      else if (change.mqAlias === 'md') {
        this.col = 2;
        this.top="5%"
        this.bottom="100%"
      }
      else {
        this.col = 2;
        this.top="5%"
        this.bottom="100%"
      }
  });
  }
   onNext() {
     this.Loop = ++this.Loop;
   }

  onUpdateStatus() {
    let refDB = this.db.database.ref('/AssessmentUserStatusTracker/' + this.tableID);
    refDB.child('scheduleded_info').child('users').child(String(this.childID)).update({
      status: (!this.isConfirmed) ? "Started" : "Finished"
    });
    this.isConfirmed = !this.isConfirmed;
  }
  onSubmit() {
    let i = 0;
    this.assessmentDatas.map(value => {
      this.userAnswered.map(userAns => {
        if (value.assesment.ans === userAns.ans) {
          i = ++i;
        }
      });
    });
    this.crt = i;
    this.wrng = this.dbsize - i;
    if (this.countdown) {
      alert("OOPS ! Time is Over\nCorrect answers: " + i + '\n' + 'Incorrect answers :' + this.wrng);
    } else {
      alert("Correct answers: " + i + '\n' + 'Incorrect answers :' + this.wrng);
    }
    localStorage.removeItem('DomainUser');
    this.router.navigate(['/homePage']);
    this.db.list('/AssessmentResultsTracker').push({
      id: this.loggedUser,
      assessent_id : this.Sdate+"_"+this.Stime+"_"+this.Sname,
      result: {
        date: moment().format("MM/DD/YYYY"),
        mark: this.crt + '/' + this.dbsize
      }
    });
    this.onUpdateStatus();
  }

  handleEvent(value: Event) {
    if (value['action'] === 'done') {
      let refDB = this.db.database.ref('/AssessmentUserStatusTracker/' + this.tableID);
      refDB.update({
        status: "Completed"
      });
      this.countdown = true;
      this.onSubmit();
    }
  }

  onSave(Uqa, Uans) {
    let index = this.userAnswered.findIndex(x => x.qa === Uqa);
    if (index > -1) {
      this.userAnswered[index]['ans'] = Uans;
    } else {
      this.userAnswered.push({ qa: Uqa, ans: Uans });
    }
    this.Loop = ++this.Loop;
  }

  onConfirm() {
    this.dbsize = this.assessmentDatas.length;
    let unAns = this.dbsize - this.userAnswered.length;
    if (confirm('Are you sure to submit?\nAnswered Questions: ' + this.userAnswered.length + '\n' + 'Unanswered Questions: ' + unAns)) {
      this.onSubmit();
    }
  }
  signOut() {
    this.service.logOut();
  }

  ngOnDestroy() {
    this.DB.unsubscribe();
  }
}
