import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditWeightDialogComponent } from './edit-weight-dialog.component';

describe('EditWeightDialogComponent', () => {
  let component: EditWeightDialogComponent;
  let fixture: ComponentFixture<EditWeightDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EditWeightDialogComponent]
    });
    fixture = TestBed.createComponent(EditWeightDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
