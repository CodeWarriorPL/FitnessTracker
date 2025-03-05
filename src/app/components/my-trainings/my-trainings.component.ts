import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/services/user.service';
import { AuthService } from 'src/services/auth.service';
import { Training } from 'src/models/training';
import { Router } from '@angular/router';
import { TrainingPlan } from 'src/models/trainingPlan';
import { Set } from 'src/models/set';

@Component({
  selector: 'app-my-trainings',
  templateUrl: './my-trainings.component.html',
  styleUrls: ['./my-trainings.component.css']
})
export class MyTrainingsComponent implements OnInit {
  trainings: Training[] = [];
  activeUser = this.authService.activeUser;
  isModalOpen = false;
  newTraining = { name: '', trainingDate: '', sets: [] as Set[] };
  trainingPlans: TrainingPlan[] = [];
  planTrainings: Training[] = [];
  selectedTrainingPlan: number | null = null;
  selectedPlanTraining: number | null = null;

  constructor(private userService: UserService, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const userId = this.authService.activeUser?.id;
    if (userId) {
      this.userService.getTrainings(userId).subscribe((trainings: Training[]) => {
        this.trainings = trainings
          .filter(training => training.trainingPlanId === null)
          .map(training => ({
            ...training,
            name: training.name || 'Brak nazwy',
            trainingDate: training.trainingDate ? new Date(training.trainingDate) : null
          }));
      });
      this.userService.getTrainingPlansByUserId(userId).subscribe((trainingPlans: TrainingPlan[]) => {
        this.trainingPlans = trainingPlans;
      });
    }
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

  viewDetails(training: Training) {
    this.router.navigate(['/individual-training', training.id]);
  }

  deleteTraining(trainingId: number) {
    if (confirm("Czy na pewno chcesz usunąć ten trening?")) {
      this.userService.deleteTraining(trainingId).subscribe(() => {
        this.trainings = this.trainings.filter(t => t.id !== trainingId);
      });
    }
  }

  openAddTrainingModal() {
    this.isModalOpen = true;
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
      this.closeAddTrainingModal();
    });
  }
  
  
}
