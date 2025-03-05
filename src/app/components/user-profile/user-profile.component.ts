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
            data: this.userMeasurements.map(m => m.weight)
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
          
          // Usuwanie pomiarów
          if (result.deletedMeasurements?.length) {
            const deleteRequests = result.deletedMeasurements.map(measurementId =>
              this.userService.deleteUserMeasurement(measurementId)
            );
  
            // Poczekaj, aż wszystkie usunięcia się wykonają, a potem odśwież wykres
            Promise.all(deleteRequests.map(req => req.toPromise())).then(() => {
              this.userService.getUserMeasurements(this.activeUser.id).subscribe(updatedMeasurements => {
                this.userMeasurements = updatedMeasurements;
                this.updateChartData();
              });
            });
          } else {
            // Jeśli nic nie usunięto, po prostu odśwież wykres
            this.updateChartData();
          }
        }
      });
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
