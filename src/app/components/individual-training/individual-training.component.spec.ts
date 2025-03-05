import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndividualTrainingComponent } from './individual-training.component';

describe('IndividualTrainingComponent', () => {
  let component: IndividualTrainingComponent;
  let fixture: ComponentFixture<IndividualTrainingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IndividualTrainingComponent]
    });
    fixture = TestBed.createComponent(IndividualTrainingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
