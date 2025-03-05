import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/services/user.service';
import { Training } from 'src/models/training';
import { Set } from 'src/models/set';
import { Exercise } from 'src/models/exercise';
import { ApexChart, ApexNonAxisChartSeries, ApexResponsive } from "ng-apexcharts";
import { BodyPart } from 'src/models/bodyPart'; // Import ENUM
import { MatDialog } from '@angular/material/dialog';
import { ChooseExerciseComponent } from '../choose-exercise/choose-exercise.component';
import { Location } from '@angular/common';




@Component({
  selector: 'app-individual-training',
  templateUrl: './individual-training.component.html',
  styleUrls: ['./individual-training.component.css']
})
export class IndividualTrainingComponent implements OnInit {
  
  trainingName: string = ''; // Domyślnie pusta nazwa
  trainingId: number | null = null;
  training: Training | null = null;
  sets: { [exerciseName: string]: Set[] } = {};
  exercisesMap: { [id: number]: Exercise } = {}; // Mapa do przechowywania ćwiczeń

  // Wykres 1: Podział serii według ćwiczeń
  chartOptionsSets: {
    series: ApexNonAxisChartSeries;
    chart: ApexChart;
    responsive: ApexResponsive[];
    labels: string[];
  } = {
    series: [],
    chart: { type: "pie", height: 400 },
    labels: [],
    responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { position: "bottom" } } }]
  };

  // Wykres 2: Podział partii ciała
  chartOptionsBodyParts: {
    series: ApexNonAxisChartSeries;
    chart: ApexChart;
    responsive: ApexResponsive[];
    labels: string[];
  } = {
    series: [],
    chart: { type: "pie", height: 400 },
    labels: [],
    responsive: [{ breakpoint: 480, options: { chart: { width: 200 }, legend: { position: "bottom" } } }]
  };

  constructor(private userService: UserService, private route: ActivatedRoute, private dialog: MatDialog, private location: Location) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.trainingId = Number(params.get('id'));
      if (this.trainingId) {
        this.getTraining(this.trainingId);
        this.getSetsGroupedByExercise(this.trainingId);
      }
    });
  }

  getSetsGroupedByExercise(trainingId: number): void {
    this.userService.getTrainingWithSets(trainingId).subscribe(
      (data) => {
        if (!data || typeof data !== 'object') return;
        if ('string' in data) delete data["string"];
        
        this.sets = data;

        // **Tworzenie mapy ćwiczeń dla szybkiego dostępu do bodyPart**
        Object.values(this.sets).forEach((sets) => {
          sets.forEach(set => {
            if (set.exercise) {
              this.exercisesMap[set.exercise.id] = set.exercise; // Zapamiętujemy ćwiczenie
            }
          });
        });

        this.updateCharts();
      },
      (error) => console.error('Błąd pobierania setów:', error)
    );
  }

  getTraining(id: number): void {
    this.userService.getTrainingById(id).subscribe(
      (data: Training) => {
        this.training = data;
        this.trainingName = data.name || 'Brak nazwy treningu'; // Jeśli nazwa nie istnieje, ustawiamy domyślny tekst
      },
      (error) => console.error('Błąd pobierania treningu:', error)
    );
  }

  deleteExercise(exerciseName: string): void {
    if (!this.trainingId) return;
  
    const sets = this.sets[exerciseName];
    if (!sets || sets.length === 0) return;
  
    const exerciseId = sets[0].exerciseId; // Pobieramy ID pierwszego zestawu
  
    this.userService.deleteTrainingExercise(this.trainingId, exerciseId).subscribe({
      next: () => {
        console.log(`Ćwiczenie ${exerciseName} usunięte.`);
        delete this.sets[exerciseName]; // Usuwamy ćwiczenie z lokalnego obiektu
        this.updateCharts(); // Aktualizacja wykresów po usunięciu
      },
      error: (err) => console.error(`Błąd usuwania ćwiczenia ${exerciseName}:`, err)
    });
  }

  addSet(exerciseName: string): void {
    if (!this.trainingId) return;
  
    const sets = this.sets[exerciseName];
    if (!sets || sets.length === 0) return;
  
    const exerciseId = sets[0].exerciseId; // Pobieramy ID ćwiczenia
    const newSet: Set = {
      id: 0, // Backend powinien przypisać ID
      exerciseId: exerciseId,
      repetitions: 10, // Domyślna wartość
      weight: 20, // Domyślna wartość
      trainingId: this.trainingId
    };
  
    this.userService.createSet(this.trainingId, newSet, exerciseId).subscribe({
      next: (createdSet) => {
        console.log(`Nowy set dodany do ${exerciseName}:`, createdSet);
        this.sets[exerciseName].push(createdSet); // Aktualizacja listy
        this.getSetsGroupedByExercise(this.trainingId); // 🔄 Pobierz ponownie dane
        this.updateCharts(); // Odśwież wykresy
      },
      error: (err) => console.error(`Błąd dodawania seta do ${exerciseName}:`, err)
    });
  }

  openExerciseDialog(): void {
    const dialogRef = this.dialog.open(ChooseExerciseComponent, {
      width: '600px',
      height: '450px',
      data: {} // Możesz przekazać dodatkowe dane, jeśli potrzebujesz
    });
  
    dialogRef.afterClosed().subscribe((selectedExercise) => {
      if (selectedExercise) {
        this.userService.createSet(this.trainingId, {
          id: 0, // Backend powinien przypisać ID
          exerciseId: selectedExercise.id,
          repetitions: 10, // Domyślna wartość
          weight: 20, // Domyślna wartość
          trainingId: this.trainingId
        }, selectedExercise.id).subscribe({
          next: (createdSet) => {
            
            console.log('Nowy set dodany:', createdSet);
            const exerciseName = selectedExercise.name;
            this.sets[exerciseName] = this.sets[exerciseName] || [];
            this.sets = { [exerciseName]: [createdSet], ...this.sets };
            this.getSetsGroupedByExercise(this.trainingId); // 🔄 Pobierz ponownie dane
            this.updateCharts(); // Odśwież wykresy
          },
          error: (err) => console.error('Błąd dodawania seta:', err)
        });

      }
    });
  }
  
  
  

  updateCharts(): void {
    setTimeout(() => {
      const exerciseNames = Object.keys(this.sets);
      const setCounts = exerciseNames.map(name => this.sets[name]?.length || 0);
  
      this.chartOptionsSets.series = setCounts;
      this.chartOptionsSets.labels = exerciseNames;
  
      // 🏋️ **Podział ćwiczeń według partii ciała**
      const bodyPartCounts: { [key: string]: number } = {};
      let totalExercises = 0;
  
      exerciseNames.forEach(exerciseName => {
        const sets = this.sets[exerciseName];
        if (!sets || sets.length === 0) return;
  
        // Pobieramy `exerciseId` i sprawdzamy w `exercisesMap`, czy mamy dane ćwiczenia
        const exerciseId = sets[0].exerciseId;
        const exercise = this.exercisesMap[exerciseId];
  
        if (exercise && exercise.bodyPart !== undefined && BodyPart[exercise.bodyPart] !== undefined) {
          const bodyPartName = BodyPart[exercise.bodyPart];
          bodyPartCounts[bodyPartName] = (bodyPartCounts[bodyPartName] || 0) + sets.length;
          totalExercises += sets.length;
        }
      });
  
      const percentages = Object.values(bodyPartCounts).map(count => (count / totalExercises) * 100);
  
      this.chartOptionsBodyParts.series = percentages;
      this.chartOptionsBodyParts.labels = Object.keys(bodyPartCounts);
    }, 500); // ⏳ 500ms opóźnienia
  }
  updateSet(setId: number, repetitions: number, weight: number, exercideId : number): void {
    const updatedSet = {
      id: setId,
      repetitions: repetitions,
      weight: weight,
      exerciseId: exercideId,
      trainingId: this.trainingId
    };
    console.log(`Aktualizacja seta ${setId}:`, updatedSet);
  
    this.userService.updateSet(updatedSet).subscribe({
      next: () => {
        console.log(`Set ${setId} zaktualizowany.`);
        this.updateCharts();
      },
      error: (err) => console.error(`Błąd aktualizacji seta:`, err)
    });

  }
  
  deleteSet(setId: number, exerciseName: string): void {
    this.userService.deleteSet(setId).subscribe({
      next: () => {
        console.log(`Set ${setId} usunięty.`);
        
        // Usuwamy set z listy
        this.sets[exerciseName] = this.sets[exerciseName].filter(set => set.id !== setId);
        
        if (this.sets[exerciseName].length === 0) {
          delete this.sets[exerciseName]; // Jeśli nie ma już setów, usuń ćwiczenie
        }
  
        this.updateCharts();
      },
      error: (err) => console.error(`Błąd usuwania seta:`, err)
    });
  }

  

  updateTrainingName(): void {
    if (!this.trainingId || !this.trainingName.trim()) return; // Zapobiega wysyłaniu pustej nazwy
  
    this.userService.updateTrainingName(this.trainingId, this.trainingName).subscribe({
      next: () => {
        console.log('Nazwa treningu zaktualizowana:', this.trainingName);
        // Serwer nie zwraca nowej nazwy, więc zostawiamy ją bez zmian
      },
      error: (err) => console.error('Błąd aktualizacji nazwy treningu:', err)
    });
  }
  
  goBack(): void {
    this.location.back(); // Cofnij do poprzedniej strony
  }
  
  
}
