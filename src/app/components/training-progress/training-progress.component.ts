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
        const formattedDate = new Date(entry.date).toLocaleDateString('pl-PL', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
        categories.push(formattedDate); // Dodaj sformatowaną datę
        oneRepMaxSeries.push(Math.round(entry.oneRepMax)); // Zaokrągl wagi
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
        ...(this.oneRepMaxData.length
          ? [
              {
                name: 'Twój najlepszy wynik z danego dnia',
                data: oneRepMaxSeries,
                color: '#ff5733',
                type: this.oneRepMaxData.length > 1 ? 'line' : 'scatter', // Zmieniamy na 'scatter' jeśli mamy tylko jeden punkt
                marker: { size: 6 }, // Dodajemy marker, aby wyglądał jak kropka
              },
            ]
          : []),
        {
          name: 'Średni wynik twojej kategorii wagowej',
          data: averageOneRepMaxSeries,
          color: '#33b5ff',
          type: 'line',
          dashArray: 5, // Linia przerywana
        },
      ],
      chart: {
        type: this.oneRepMaxData.length > 1 ? 'line' : 'scatter', // Zmieniamy typ wykresu
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