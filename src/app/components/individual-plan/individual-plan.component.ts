  import { Component } from '@angular/core';
  import { UserService } from 'src/services/user.service';
  import { OnInit } from '@angular/core';
  import { ActivatedRoute } from '@angular/router';
  import { TrainingPlan } from 'src/models/trainingPlan';
  import { Training } from 'src/models/training';
  import { AuthService } from 'src/services/auth.service';
  import { Set } from 'src/models/set';
  import { Exercise } from 'src/models/exercise';
  import { MatDialog } from '@angular/material/dialog';
  import { ChooseExerciseComponent } from '../choose-exercise/choose-exercise.component';
  import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable';

  @Component({
    selector: 'app-individual-plan',
    templateUrl: './individual-plan.component.html',
    styleUrls: ['./individual-plan.component.css']
  })
  export class IndividualPlanComponent implements OnInit {
    trainingPlan: TrainingPlan | null = null;
    trainings: Training[] = []; // Lista treningów planu
    selectedTrainingId: number | null = null; // ID otwartego treningu
    activeUser = this.authService.activeUser;
    sets: { [trainingId: number]: { [exerciseName: string]: Set[] } } = {}; // Nowa struktura
    exercisesMap: { [id: number]: Exercise } = {};
  
    constructor(
      private userService: UserService,
      private route: ActivatedRoute,
      private authService: AuthService,
      private dialog: MatDialog
    ) {}
  
    ngOnInit(): void {
      this.route.paramMap.subscribe((params) => {
        const planId = Number(params.get('id'));
        this.getTrainingPlan(planId);
        this.getAllTrainingsForPlan(planId);
      });
    }
  
    getTrainingPlan(id: number): void {
      this.userService.getTrainingPlanById(id).subscribe((data: TrainingPlan) => {
        this.trainingPlan = data;
      });
    }
  
    getAllTrainingsForPlan(trainingPlanId: number): void {
      this.userService.getAllPlanTrainigs(trainingPlanId).subscribe((data: Training[]) => {
        this.trainings = data;
  
        // Pobranie setów dla każdego treningu
        this.trainings.forEach(training => {
          this.getSetsGroupedByExercise(training.id);
        });
      });
    }
  
    toggleTraining(trainingId: number): void {
      this.selectedTrainingId = this.selectedTrainingId === trainingId ? null : trainingId;
    }
  
    createTrainingForPlan(): void {
      if (!this.trainingPlan) return;
  
      const newTraining: Training = {
        id: 0, // Backend powinien przypisać ID
        name: 'Nowy Trening', // Domyślna nazwa
        isTrainingPlan: true,
        trainingPlanId: this.trainingPlan.id,
      };
  
      console.log("Wysyłany trening:", newTraining);
  
      this.userService.createTraining(this.activeUser.id, newTraining).subscribe({
        next: (createdTraining) => {
          console.log('Nowy trening dodany:', createdTraining);
          this.trainings.push(createdTraining); // Aktualizacja listy
          this.getSetsGroupedByExercise(createdTraining.id); // Pobranie setów dla nowego treningu
        },
        error: (err) => console.error('Błąd dodawania treningu:', err),
      });
    }
  
    getSetsGroupedByExercise(trainingId: number): void {
      this.userService.getTrainingWithSets(trainingId).subscribe(
        (data) => {
          if (!data || typeof data !== 'object') return;
          if ('string' in data) delete data["string"];
  
          this.sets[trainingId] = data; // Przechowywanie setów dla konkretnego treningu
  
          // **Tworzenie mapy ćwiczeń**
          Object.values(data).forEach((sets) => {
            sets.forEach(set => {
              if (set.exercise) {
                this.exercisesMap[set.exercise.id] = set.exercise;
              }
            });
          });
  
          console.log(`Sety dla treningu ${trainingId}:`, this.sets[trainingId]);
        },
        (error) => console.error(`Błąd pobierania setów dla treningu ${trainingId}:`, error)
      );
    }
    getExerciseNames(trainingId: number): string[] {
      return this.sets[trainingId] ? Object.keys(this.sets[trainingId]) : [];
    }
    addExercise(trainingId: number): void {
      const dialogRef = this.dialog.open(ChooseExerciseComponent, {
        width: '400px',
      });
    
      dialogRef.afterClosed().subscribe((selectedExercise) => {
        if (selectedExercise) {
          const newSet: Set = {
            id: 0, // Backend przypisze ID
            exerciseId: selectedExercise.id,
            repetitions: 10, // Domyślne wartości
            weight: 20,
            trainingId: trainingId
          };
    
          this.userService.createSet(trainingId, newSet, selectedExercise.id).subscribe({
            next: (createdSet) => {
              console.log('Nowy set dodany:', createdSet);
              
              if (!this.sets[trainingId]) {
                this.sets[trainingId] = {};
              }
              if (!this.sets[trainingId][selectedExercise.name]) {
                this.sets[trainingId][selectedExercise.name] = [];
              }
    
              this.sets[trainingId][selectedExercise.name].push(createdSet);
              this.getSetsGroupedByExercise(trainingId); // Odświeżenie danych
            },
            error: (err) => console.error('Błąd dodawania seta:', err)
          });
        }
      });
    }
    
    addSet(trainingId: number, exerciseName: string): void {
      if (!this.sets[trainingId] || !this.sets[trainingId][exerciseName]) {
        console.error(`Brak ćwiczenia ${exerciseName} w treningu ${trainingId}`);
        return;
      }
    
      const sets = this.sets[trainingId][exerciseName];
      if (!sets || sets.length === 0) return;
    
      const exerciseId = sets[0].exerciseId;
      const newSet: Set = {
        id: 0,
        exerciseId: exerciseId,
        repetitions: 10,
        weight: 20,
        trainingId: trainingId
      };
    
      this.userService.createSet(trainingId, newSet, exerciseId).subscribe({
        next: (createdSet) => {
          console.log(`Nowy set dodany do ${exerciseName} w treningu ${trainingId}:`, createdSet);
    
          if (!this.sets[trainingId]) {
            this.sets[trainingId] = {};
          }
          if (!this.sets[trainingId][exerciseName]) {
            this.sets[trainingId][exerciseName] = [];
          }
    
          this.sets[trainingId][exerciseName].push(createdSet);
          this.getSetsGroupedByExercise(trainingId);
        },
        error: (err) => console.error(`Błąd dodawania seta do ${exerciseName} w treningu ${trainingId}:`, err)
      });
    }
    removeSet(setId:number, exerciseName:string): void {
      this.userService.deleteSet(setId).subscribe({
        next: () => {
          console.log(`Usunięto set ${setId}`);
          this.getSetsGroupedByExercise(this.selectedTrainingId);
        },
        error: (err) => console.error(`Błąd usuwania seta ${setId}:`, err)
      });
    }
    updateSet(set: Set): void {
      this.userService.updateSet(set).subscribe({
        next: (updatedSet) => {
          console.log(`Zaktualizowano set ${updatedSet.id}:`, updatedSet);
        },
        error: (err) => console.error(`Błąd aktualizacji seta ${set.id}:`, err),
      });
    }
    
    deleteExercise(trainingId: number, exerciseName: string): void {
      if (!this.sets[trainingId] || !this.sets[trainingId][exerciseName]) {
        console.warn(`Brak ćwiczenia ${exerciseName} w treningu ${trainingId}`);
        return;
      }
    
      const sets = this.sets[trainingId][exerciseName];
      if (!sets.length) return;
    
      const exerciseId = sets[0].exerciseId;
    
      this.userService.deleteTrainingExercise(trainingId, exerciseId).subscribe({
        next: () => {
          console.log(`Ćwiczenie ${exerciseName} usunięte.`);
          delete this.sets[trainingId][exerciseName]; // Usuń z lokalnego obiektu
        },
        error: (err) => console.error(`Błąd usuwania ćwiczenia ${exerciseName}:`, err)
      });
    }
    editingTrainingId: number | null = null;
    editedTrainingName: string = '';
    
    editTraining(training: Training): void {
      this.editingTrainingId = training.id;
      this.editedTrainingName = training.name;
    }
    
    saveTrainingName(): void {
      if (!this.editedTrainingName.trim() || this.editingTrainingId === null) {
        alert('Nazwa treningu nie może być pusta.');
        return;
      }
    
      this.userService.updateTrainingName(this.editingTrainingId, this.editedTrainingName).subscribe({
        next: () => {
          console.log('Nazwa treningu zaktualizowana:', this.editedTrainingName);
    
          // Aktualizujemy nazwę w liście treningów
          const training = this.trainings.find(t => t.id === this.editingTrainingId);
          if (training) {
            training.name = this.editedTrainingName;
          }
    
          this.editingTrainingId = null; // Koniec edycji
        },
        error: (err) => console.error('Błąd aktualizacji nazwy treningu:', err)
      });
    }
    
    deleteTraining(trainingId: number): void {
      if (!confirm('Czy na pewno chcesz usunąć ten trening?')) return;
    
      this.userService.deleteTraining(trainingId).subscribe({
        next: () => {
          this.trainings = this.trainings.filter(t => t.id !== trainingId);
          console.log('Trening usunięty:', trainingId);
    
          // Reset edycji, jeśli usunięto aktualnie edytowany trening
          if (this.editingTrainingId === trainingId) {
            this.editingTrainingId = null;
          }
        },
        error: (err) => console.error('Błąd usuwania treningu:', err)
      });
    }
    exportToPDF(): void {
      const doc = new jsPDF();
      const columns = ['Trening', 'Cwiczenie', 'Waga', 'Powtórzenia'];
      const data: any[] = [];
    
      this.trainings.forEach(training => {
        Object.entries(this.sets[training.id] || {}).forEach(([exerciseName, sets]: [string, Set[]]) => {
          sets.forEach(set => {
            data.push([
              training.name,
              exerciseName,
              set.weight + ' kg',
              set.repetitions
            ]);
          });
        });
      });
    
      autoTable(doc, { head: [columns], body: data });
      doc.save('trening.pdf');
    }


    
  
    
    
  }
  