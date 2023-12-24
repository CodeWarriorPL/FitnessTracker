import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-add-set',
  templateUrl: './add-set.component.html',
  styleUrls: ['./add-set.component.css']
})
export class AddSetComponent {
  weight: number;
  repetitions: number;
  

  constructor(
    public dialogRef: MatDialogRef<AddSetComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    
  ) {

  }

  onAddSet() {
    // Emit the entered values and exerciseId back to the calling component
    this.dialogRef.close({
      
      weight: this.weight,
      repetitions: this.repetitions
    });
  }

  onClose() {
    // Close the dialog without emitting any values
    this.dialogRef.close();
  }
}
