import { TrainingsComponent } from './../trainings/trainings.component';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';


import { Exercise } from './../../../models/exercise';
import { UserService } from 'src/services/user.service';
import { Training } from 'src/models/training';
import { Set } from 'src/models/set';
import { AddSetComponent } from '../add-set/add-set.component';
import { ChooseExerciseComponent } from '../choose-exercise/choose-exercise.component';

@Component({
  selector: 'app-training-section',
  templateUrl: './training-section.component.html',
  styleUrls: ['./training-section.component.css']
})
export class TrainingSectionComponent implements OnInit {
  exercises: Exercise[] = [];
  set: Set = { id: 0, weight: 0, repetitions: 0, exerciseId: 0 };

  @Input() training: Training;
  showDetails = false;
  trainingExist = true;
  showAddSetWindow = false;
  groupedSets: Map<number, any[]> = new Map<number, any[]>();
  isEditing = false;

  constructor(private userService: UserService, private dialog: MatDialog,private trainingsComponent : TrainingsComponent) {}

  ngOnInit() {
    this.loadExercises();
  }

  loadExercises() {
    this.userService.getExercises().subscribe(
      (data: any[]) => {
        this.exercises = data;
      },
      (error) => {
        console.error('Wystąpił błąd podczas pobierania ćwiczeń:', error);
      }
    );
  }

  openAddSetDialog(trainingId: number, exerciseId: number) {
    const dialogRef = this.dialog.open(AddSetComponent, {
      width: '600px',
      height: '450px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.handleAddSetResult(result, trainingId, exerciseId);
      } else {
        console.log('Dialog closed without result');
      }
    });
  }

  handleAddSetResult(result: any, trainingId: number, exerciseId: number) {
    this.set.weight = result.weight;
    this.set.repetitions = result.repetitions;

    this.userService.createSet(trainingId, this.set, exerciseId).subscribe(
      (data: any) => {
        this.training.sets.push(data);
        this.getAndGroupSets(trainingId);
      },
      (error) => {
        console.error('Wystąpił błąd podczas dodawania serii:', error);
      }
    );
  }
  openAddExerciseDialog(trainingId: number) {
    const dialogRef = this.dialog.open(ChooseExerciseComponent, {
      width: '600px',
      height: '450px',
    });


    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.handleAddExerciseResult(result, trainingId);
      } else {
        console.log('Dialog closed without result');
      }
    });
  }
  handleAddExerciseResult(result: any, trainingId: number) {
    this.userService.createSet(trainingId, this.set, result.id).subscribe(
      (data: any) => {
        this.training.sets.push(data);
        this.getAndGroupSets(trainingId);
      },
      (error) => {
        console.error('Wystąpił błąd podczas dodawania serii:', error);
      }
    );
    
  }

  toggleDetails(trainingId: number) {
    this.showDetails = !this.showDetails;
    this.getAndGroupSets(trainingId);
  }
  toggleEdit(set : Set) {
    set.isEditing = !set.isEditing;
    
  }
  saveEdit(set : Set) {
    set.isEditing = !set.isEditing;
    console.log(set);
    this.userService.updateSet(set).subscribe(
      () => {
        this.getAndGroupSets(this.training.id);
      },
      (error) => {
        console.error('Wystąpił błąd podczas edycji serii:', error);
      }
    );
  }

  getExerciseName(exerciseId: number): string {
    const exercise = this.exercises.find((exercise) => exercise.id === exerciseId);
    return exercise ? exercise.exerciseName : '';
  }

  getAndGroupSets(trainingId: number): void {
    this.userService.getSets(trainingId).subscribe(
      (data: any) => {
        this.groupSetsByExerciseId(data);
        this.training.sets = data;
      },
      (error) => {
        console.error('Wystąpił błąd podczas pobierania serii:', error);
      }
    );
  }

  groupSetsByExerciseId(data: any[]) {
    this.groupedSets.clear();
    data.forEach((set: any) => {
      const exerciseId = set.exerciseId;
      if (!this.groupedSets.has(exerciseId)) {
        this.groupedSets.set(exerciseId, []);
      }
      this.groupedSets.get(exerciseId).push(set);
    });
  }
  deleteTraining(trainingId : number) {
    console.log(trainingId);
    this.userService.deleteTraining(trainingId).subscribe(
      () => {
        this.training = null;
        this.trainingsComponent.getTrainings();
      },
      (error) => {
        console.error('Wystąpił błąd podczas usuwania treningu:', error);
      }
    );
  }
  deleteSet(setId : number) {
    console.log(setId);
    this.userService.deleteSet(setId).subscribe(
      () => {
        this.getAndGroupSets(this.training.id);
      },
      (error) => {
        console.error('Wystąpił błąd podczas usuwania serii:', error);
      }
    );
  }
  deleteExerciseSets(exerciseId : number, trainingId : number) {
    console.log(exerciseId);
    this.userService.deleteSetsByExercise(exerciseId, trainingId).subscribe(
      () => {
        this.getAndGroupSets(this.training.id);
      },
      (error) => {
        console.error('Wystąpił błąd podczas usuwania serii:', error);
      }
    );
  }
}
