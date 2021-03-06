import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleAssessmentComponent } from './schedule-assessment.component';

describe('ScheduleAssessmentComponent', () => {
  let component: ScheduleAssessmentComponent;
  let fixture: ComponentFixture<ScheduleAssessmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScheduleAssessmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleAssessmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
