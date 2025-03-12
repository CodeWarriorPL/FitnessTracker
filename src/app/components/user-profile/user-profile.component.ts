import { Component, OnInit, ViewChild } from '@angular/core';  
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth.service';
import { DateAdapter } from '@angular/material/core'; 
import { UserService } from 'src/services/user.service';
import { map } from 'rxjs/operators';
import { Observable, BehaviorSubject } from 'rxjs'; 
import { Training } from 'src/models/training';
import { MatCalendar } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { EditWeightDialogComponent } from '../edit-weight-dialog/edit-weight-dialog.component'; 
import { UserMeasurement } from 'src/models/userMeasurement'; 
import { startOfMonth } from 'date-fns';
import { TrainingPlan } from 'src/models/trainingPlan';
import { Set } from 'src/models/set';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis
} from "ng-apexcharts";

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  activeUser = this.authService.activeUser;
  private highlightedDatesSubject = new BehaviorSubject<Date[]>([]); 
  highlightedDates$ = this.highlightedDatesSubject.asObservable(); 
  userWeight = 0;
  userMeasurements: UserMeasurement[] = [];

  @ViewChild(MatCalendar) calendar!: MatCalendar<Date>;

  currentMonthTrainings$: Observable<Date[]>;
  trainingCount$: Observable<number>;

  trainings: Training[] = [];
  isModalOpen = false;
    newTraining = { name: '', trainingDate: '', sets: [] as Set[] };
    trainingPlans: TrainingPlan[] = [];
    planTrainings: Training[] = [];
    selectedTrainingPlan: number | null = null;
    selectedPlanTraining: number | null = null;

  chartOptions: {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
  };

  constructor(
    private router: Router, 
    private authService: AuthService, 
    private dateAdapter: DateAdapter<Date>, 
    private userService: UserService,
    private dialog: MatDialog
  ) {
    this.chartOptions = {
      series: [],
      chart: {
        type: "line",
        height: 350
      },
      xaxis: {
        categories: []
      }
    };

    this.currentMonthTrainings$ = this.highlightedDates$.pipe(
      map(dates => {
        const now = new Date();
        const monthStart = startOfMonth(now);
        return dates.filter(date => date >= monthStart && date <= now);
      })
    );

    this.trainingCount$ = this.currentMonthTrainings$.pipe(
      map(dates => dates.length)
    );
  }

  ngOnInit() {
    if (this.activeUser) {
      this.userService.getTrainingPlansByUserId(this.activeUser.id  ).subscribe((trainingPlans: TrainingPlan[]) => {
        this.trainingPlans = trainingPlans;
        console.log(this.trainingPlans);
      });
      this.userService.getTrainings(this.activeUser.id).subscribe((trainings: Training[]) => {
        this.trainings = trainings
          .filter(training => training.trainingPlanId === null)
          .map(training => ({
            ...training,
            name: training.name || 'Brak nazwy',
            trainingDate: training.trainingDate ? new Date(training.trainingDate) : null
          }));
      });
      this.userService.getTrainings(this.activeUser.id).pipe(
        map((trainings: Training[]) => trainings.map(training => new Date(training.trainingDate)))
      ).subscribe(dates => {
        this.highlightedDatesSubject.next(dates);
        if (this.calendar) {
          setTimeout(() => this.calendar.updateTodaysDate(), 100);
        }
      });
  
      // Pobranie pomiarów wagi i aktualizacja wykresu
      this.userService.getUserMeasurements(this.activeUser.id).subscribe(measurements => {
        this.userMeasurements = measurements;
        this.updateChartData();
      });
    }
  }

  updateChartData() {
    if (!this.userMeasurements.length) return; // Jeśli brak danych, nic nie rób
  
    // Sortujemy pomiary według daty
    this.userMeasurements.sort((a, b) => new Date(a.measurementDate).getTime() - new Date(b.measurementDate).getTime());
  
    // Aktualizujemy wykres po krótkim czasie, aby Angular wykrył zmianę
    setTimeout(() => {
      this.chartOptions = {
        ...this.chartOptions,
        series: [
          {
            name: "Waga (kg)",
            data: this.userMeasurements.map(m => m.weight),
            type: this.userMeasurements.length > 1 ? 'line' : 'scatter', // Zmieniamy na 'scatter' jeśli mamy tylko jeden punkt
          }
        ],
        xaxis: {
          categories: this.userMeasurements.map(m => new Date(m.measurementDate).toLocaleDateString())
        }
      };
    }, 200);
  }
  
  

  saveWeight() {
    const newMeasurement: UserMeasurement = {
      measurementDate: new Date(),
      weight: this.userWeight,
      userId: this.activeUser.id
    };

    this.userService.createUserMeasurement(this.activeUser.id, newMeasurement).subscribe(() => {
      this.userService.getUserMeasurements(this.activeUser.id).subscribe(measurements => {
        this.userMeasurements = measurements;
        this.updateChartData();
      });
    });
  }

  editWeight() {
    this.userService.getUserMeasurements(this.activeUser.id).subscribe(measurements => {
      this.userMeasurements = measurements;
    
      const dialogRef = this.dialog.open(EditWeightDialogComponent, {
        width: '800px',
        data: { measurements: this.userMeasurements }
      });
    
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.userMeasurements = result.updatedMeasurements ?? this.userMeasurements;
      
          if (result.deletedMeasurements?.length) {
            const deleteRequests = result.deletedMeasurements.map(measurementId =>
              this.userService.deleteUserMeasurement(measurementId)
            );
  
            Promise.all(deleteRequests.map(req => req.toPromise())).then(() => {
              this.userService.getUserMeasurements(this.activeUser.id).subscribe(updatedMeasurements => {
                this.userMeasurements = updatedMeasurements;
                this.updateChartData();
              });
            });
          } else {
            this.updateChartData();
            
          }
        }
      });
    });
  }

  onDateClick(date: Date) {
    // Przekazujemy obiekt Date bez formatowania
    console.log('Data:', date);
  
    this.userService.getTrainingByDate(this.activeUser.id, date).subscribe(training => {
      if (training) {
        // Jeśli trening istnieje na tej dacie, przejdź do szczegółów treningu
        console.log('Znaleziono trening:', training);
        this.router.navigate(['/individual-training', training.id]); // Przekierowanie do szczegółów treningu
      } else {
        console.log('Brak treningu w wybranym dniu.');
      }
    });
  }
  loadPlanTrainings() {
    if (this.selectedTrainingPlan) {
      this.userService.getAllPlanTrainigs(this.selectedTrainingPlan).subscribe((trainings: Training[]) => {
        this.planTrainings = trainings;
      });
    } else {
      this.planTrainings = [];
    }
  }

  loadSetsFromPlanTraining() {
    if (this.selectedPlanTraining) {
      this.userService.getSets(this.selectedPlanTraining).subscribe((sets: Set[]) => {
        this.newTraining.sets = sets.map(set => ({ ...set, id: 0})); // Kopiowanie bez ID
        console.log(this.newTraining.sets);
      });
    } else {
      this.newTraining.sets = [];
      console.log("sss");
    }
  }

  openAddTrainingModal() {
    this.isModalOpen = true;
    console.log(this.trainingPlans);
  }

  closeAddTrainingModal() {
    this.isModalOpen = false;
    this.newTraining = { name: '', trainingDate: '', sets: [] };
    this.selectedTrainingPlan = null;
    this.selectedPlanTraining = null;
    this.planTrainings = [];
  }

  addTraining() {
    if (!this.newTraining.name || !this.newTraining.trainingDate) {
      alert("Proszę podać nazwę i datę treningu.");
      return;
    }
  
    const userId = this.authService.activeUser?.id;
    if (!userId) return;
  
    // Poczekaj, aż sety się załadują
    if (this.selectedPlanTraining) {
      this.userService.getSets(this.selectedPlanTraining).subscribe((sets: Set[]) => {
        this.newTraining.sets = sets.map(set => ({ ...set, id: 0 }));
  
        // Teraz sety są dostępne, więc możemy wysłać trening
        this.createTraining(userId);
      });
    } else {
      this.createTraining(userId);
    }
  }
  
createTraining(userId: number) {
  const trainingData: Training = {
    name: this.newTraining.name,
    trainingDate: new Date(this.newTraining.trainingDate),
    sets: this.newTraining.sets
  };

  this.userService.createTrainingWithSets(userId, trainingData).subscribe((createdTraining) => {
    this.trainings.push(createdTraining);
    console.log('Dodano nowy trening:', createdTraining);
    
    // Dodaj nową datę do listy podświetlanych dat
    const updatedDates = [...this.highlightedDatesSubject.getValue(), new Date(createdTraining.trainingDate)];
    this.highlightedDatesSubject.next(updatedDates);
    
    // Odświeżenie kalendarza
    setTimeout(() => this.calendar.updateTodaysDate(), 100);

    this.closeAddTrainingModal();
  });
}


  
  
  
  
  

  dateClass: (date: Date) => string = (date: Date) => {
    const highlightedDates = this.highlightedDatesSubject.getValue();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    const matchedDate = highlightedDates.find(d => d.toDateString() === date.toDateString());
    return matchedDate ? (matchedDate >= today ? 'upcoming-training' : 'highlighted-date') : '';
  };

  onClick(string: string) {
    this.router.navigate(['/training']);
  }
}
