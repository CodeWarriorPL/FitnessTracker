import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndividualPlanComponent } from './individual-plan.component';

describe('IndividualPlanComponent', () => {
  let component: IndividualPlanComponent;
  let fixture: ComponentFixture<IndividualPlanComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IndividualPlanComponent]
    });
    fixture = TestBed.createComponent(IndividualPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
