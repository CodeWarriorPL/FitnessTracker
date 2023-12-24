import { Exercise } from 'src/models/exercise';
import { Component } from '@angular/core';
import { EChartsOption } from 'echarts';
import { ActivatedRoute } from '@angular/router';
import { Set } from 'src/models/set';
import { Training } from 'src/models/training';
import { AuthService } from './../../../services/auth.service';
import { UserService } from './../../../services/user.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-progress-chart',
  templateUrl: './progress-chart.component.html',
  styleUrls: ['./progress-chart.component.css'],
})
export class ProgressChartComponent {
  options: EChartsOption;
  sets: Set[] = [];
  chartData: any[] = [];
  trainingDates: Date[] = [];
  exerciseName: string;

  activeUser = this.authService.activeUser;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const parameter = params['exerciseId'];
      const exerciseName = params['exerciseName'];
      this.exerciseName = exerciseName;
      this.userService.getUserSetsByExercise(this.activeUser.id, parameter).subscribe(
        (sets: Set[]) => {
          this.sets = sets;
          const requests = this.sets.map((element) =>
            this.userService.getTrainingById(element.trainingId)
          );

          forkJoin(requests).subscribe(
            (trainings: Training[]) => {
              trainings.forEach((training: Training, index: number) => {
                const maxRepWeight = this.calculateMaxRepWeight(
                  this.sets[index].weight,
                  this.sets[index].repetitions
                );

                this.chartData.push(maxRepWeight);
                this.trainingDates.push(new Date(training.trainingDate));

                if (this.chartData.length === this.sets.length) {
                  // Once all data is collected, sort and update the chart
                  this.sortDataAndRefreshChart();
                }
              });
            },
            (error) => {
              console.error('Error loading trainings:', error);
            }
          );
        },
        (error) => {
          console.error('Error loading sets:', error);
        }
      );
    });
  }

  sortDataAndRefreshChart(): void {
    // Sort data based on training dates
    const sortedIndices = this.trainingDates
      .map((date, index) => ({ date, index }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map((item) => item.index);

    this.chartData = sortedIndices.map((index) => this.chartData[index]);
    this.trainingDates = sortedIndices.map((index) => this.trainingDates[index]);

    // Update the chart
    this.updateChart();
  }

  updateChart(): void {
    this.options = {
      tooltip: {},
      xAxis: {
        type: 'category',
        data: this.trainingDates.map((date) => date.toISOString().split('T')[0]),
        silent: false,
        splitLine: {
          show: false,
        },
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: 'Max Rep Weight',
          type: 'bar',
          data: this.chartData,
          animationDelay: (idx) => idx * 10,
        },
      ],
      animationEasing: 'elasticOut',
      animationDelayUpdate: (idx) => idx * 5,
    };
  }

  calculateMaxRepWeight(weight: number, reps: number): number {
    return Math.round(weight / (1.0278 - reps * 0.0278));
  }
}
