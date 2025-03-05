import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from 'src/services/user.service';

@Component({
  selector: 'app-edit-weight-dialog',
  templateUrl: './edit-weight-dialog.component.html',
  styleUrls: ['./edit-weight-dialog.component.css']
})
export class EditWeightDialogComponent {
  measurements: any[];
  deletedMeasurements: number[] = []; // Lista ID usuniętych pomiarów

  constructor(
    public dialogRef: MatDialogRef<EditWeightDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { measurements: any[] }
  ) {
    this.measurements = [...data.measurements]; // Kopia danych, aby nie zmieniać oryginalnych
  }

  save() {
    this.dialogRef.close({
      deletedMeasurements: this.deletedMeasurements
    });
  }

  close() {
    this.dialogRef.close();
  }

  markForDeletion(measurementId: number) {
    this.deletedMeasurements.push(measurementId);
    this.measurements = this.measurements.filter(m => m.id !== measurementId); // Usuń tylko wizualnie
  }
}
