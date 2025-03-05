import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingProgressComponent } from './training-progress.component';

describe('TrainingProgressComponent', () => {
  let component: TrainingProgressComponent;
  let fixture: ComponentFixture<TrainingProgressComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrainingProgressComponent]
    });
    fixture = TestBed.createComponent(TrainingProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
