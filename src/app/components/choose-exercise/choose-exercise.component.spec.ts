import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseExerciseComponent } from './choose-exercise.component';

describe('ChooseExerciseComponent', () => {
  let component: ChooseExerciseComponent;
  let fixture: ComponentFixture<ChooseExerciseComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChooseExerciseComponent]
    });
    fixture = TestBed.createComponent(ChooseExerciseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
