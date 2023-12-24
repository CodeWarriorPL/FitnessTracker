import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Exercise } from 'src/models/exercise';
import { BodyPart } from 'src/models/bodyPart';
import { UserService } from 'src/services/user.service';

@Component({
  selector: 'app-choose-exercise',
  templateUrl: './choose-exercise.component.html',
  styleUrls: ['./choose-exercise.component.css']
})
export class ChooseExerciseComponent {
  selectedExercise: Exercise | null = null;
  exercises: Exercise[] = [];
  filteredExercises: Exercise[] = [];
  bodyParts: string[] = [];

  selectedBodyPart: string | null = null;

  constructor(
    private userService: UserService,
    public dialogRef: MatDialogRef<ChooseExerciseComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngOnInit(): void {
    this.userService.getExercises().subscribe((data: Exercise[]) => {
      this.exercises = data;
      this.filteredExercises = data;
    });

    // Populate bodyParts array with enum values as strings
    this.bodyParts = this.getBodyPartValues();
  }

  exerciseChosen(exercise: Exercise) {
    this.selectedExercise = exercise;
  }

  // Method to handle exercise sorting based on body part or show all exercises
  sortExercisesByBodyPart(bodyPart: string | null) {
    if (bodyPart) {
      if (bodyPart === 'all') {
        this.filteredExercises = this.exercises;
      } else {
        // Convert the selectedBodyPart back to the numeric value of the enum
        const selectedBodyPartValue = BodyPart[bodyPart];
        this.filteredExercises = this.exercises.filter(exercise => exercise.bodyPart === selectedBodyPartValue);
      }
    }
  }
  

  // Function to get enum values as strings
  getBodyPartValues(): string[] {
    return Object.keys(BodyPart)
      .filter(key => isNaN(Number(BodyPart[key])))
      .map(key => BodyPart[key]);
  }
}
