import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/services/auth.service';
import { UserService } from 'src/services/user.service';
import { Router } from '@angular/router'; // Import Router for navigation

@Component({
  selector: 'app-training-progress',
  templateUrl: './training-progress.component.html',
  styleUrls: ['./training-progress.component.css']
})
export class TrainingProgressComponent implements OnInit {
  exercises: any[] = [];
  filteredExercises: any[] = []; // Filtered exercises based on search query
  currentWeight: number = 0;
  selectedExercise: string = '';
  exerciseData: any[] = [];
  oneRepMaxData: any[] = [];  // For storing the one-rep max history data
  searchQuery: string = ''; // Store the search query for filtering exercises

  chartOptions: any = {
    series: [],
    chart: {
      type: 'line',
      height: 350
    },
    xaxis: {
      categories: []
    }
  };

  constructor(private authService: AuthService, private userService: UserService, private router: Router) {}

  activeUser = this.authService.activeUser;

  ngOnInit(): void {
    this.userService.getExercises().subscribe((data: any[]) => {
      this.exercises = data;
      this.filteredExercises = data; // Initially, no filter is applied
    });

    this.userService.getLatestUserMeasurement(this.activeUser.id).subscribe((data: any) => {
      this.currentWeight = data.weight;
      console.log('Current weight:', this.currentWeight);
    });
  }

  onExerciseChange(): void {
    if (!this.selectedExercise) return;

    // Fetch the oneRepMax history data
    this.userService.getOneRepMaxHistory(this.activeUser.id, this.selectedExercise).subscribe((data: any[]) => {
      console.log('One Rep Max History:', data);
      this.oneRepMaxData = data; // Store the history data
      this.updateChart();
    });

    // Fetch the averageOneRepMax data
    this.userService.getAverageOneRepMax(this.selectedExercise).subscribe((data: any[]) => {
      this.exerciseData = data;
      console.log('Average One Rep Max Data:', this.exerciseData);
      this.updateChart();
    });
  }
  updateChart(): void {
    const categories: string[] = [];
    const oneRepMaxSeries: number[] = [];
    const averageOneRepMax: number = this.exerciseData[0]?.averageOneRepMax || 0; // Pobierz średnią wartość lub 0, jeśli brak danych
  
    // Jeśli oneRepMaxData jest dostępna, przygotuj dane dla wykresu
    if (this.oneRepMaxData.length) {
      this.oneRepMaxData.forEach((entry: any) => {
        categories.push(entry.date); // Użyj daty jako kategorii (oś X)
        oneRepMaxSeries.push(entry.oneRepMax); // Dodaj oneRepMax do serii danych
      });
    }
  
    // Jeśli oneRepMaxData jest pusta, użyj jednej kategorii (np. "Brak danych")
    if (!categories.length) {
      categories.push('Brak danych');
    }
  
    // Przygotuj dane dla averageOneRepMax jako stałą linię poziomą
    const averageOneRepMaxSeries: number[] = Array(categories.length).fill(averageOneRepMax); // Wypełnij całą oś X wartością średnią
  
    // Ustaw opcje wykresu
    this.chartOptions = {
      series: [
        // Dodaj serię dla oneRepMax tylko jeśli dane są dostępne
        ...(this.oneRepMaxData.length
          ? [
              {
                name: 'Twój najlepszy wynik z danego dnia',
                data: oneRepMaxSeries,
                color: '#ff5733', // Kolor dla oneRepMax
              },
            ]
          : []),
        // Dodaj serię dla averageOneRepMax
        {
          name: 'Średni wynik twojej kategorii wagowej',
          data: averageOneRepMaxSeries,
          color: '#33b5ff', // Kolor dla averageOneRepMax
          type: 'line',
          dashArray: 5, // Linia przerywana dla averageOneRepMax
        },
      ],
      chart: {
        type: 'line',
        height: 350,
      },
      xaxis: {
        categories: categories,
      },
    };
  }

  

  // Navigate back to the previous page
  goBack(): void {
    this.router.navigate(['/user-profile']); // Replace with actual route
  }
}