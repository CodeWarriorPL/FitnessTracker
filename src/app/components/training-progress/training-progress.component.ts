import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/services/auth.service';
import { UserService } from 'src/services/user.service';

@Component({
  selector: 'app-training-progress',
  templateUrl: './training-progress.component.html',
  styleUrls: ['./training-progress.component.css']
})
export class TrainingProgressComponent implements OnInit {
  exercises: any[] = [];
  currentWeight: number = 0;
  selectedExercise: string = '';
  exerciseData: any[] = [];

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

  constructor(private authService: AuthService, private userService: UserService) {}


  activeUser = this.authService.activeUser;

  ngOnInit(): void {
    this.userService.getExercises().subscribe((data: any[]) => {
      this.exercises = data;
    });

    this.userService.getLatestUserMeasurement(this.activeUser.id).subscribe((data: any) => {
      this.currentWeight = data.weight;
      console.log('Current weight:', this.currentWeight);
    });
  }

  onExerciseChange(): void {
    if (!this.selectedExercise) return;
    
    this.userService.getAverageOneRepMax(this.selectedExercise).subscribe((data: any[]) => {
      this.exerciseData = data;
      console.log('Exercise Data:', this.exerciseData);
      this.updateChart();
    });
  }

  updateChart(): void {
    if (!this.exerciseData.length) return;
    
    // Znajdź najbliższą kategorię wagową
    let closestCategory = this.exerciseData.reduce((prev, curr) => {
      return Math.abs(curr.weightCategory - this.currentWeight) < Math.abs(prev.weightCategory - this.currentWeight) ? curr : prev;
    });

    this.chartOptions = {
      series: [{
        name: 'Średni 1RM',
        data: [closestCategory.averageOneRepMax]
      }],
      chart: {
        type: 'line',
        height: 350
      },
      xaxis: {
        categories: [closestCategory.weightCategory + ' kg']
      }
    };
  }
}
