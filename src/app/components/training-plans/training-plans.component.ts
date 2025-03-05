  import { Component, OnInit } from '@angular/core';
  import { AuthService } from 'src/services/auth.service';
  import { UserService } from 'src/services/user.service';
  import { TrainingPlan } from 'src/models/trainingPlan';
  import { Router } from '@angular/router';

  @Component({
    selector: 'app-training-plans',
    templateUrl: './training-plans.component.html',
    styleUrls: ['./training-plans.component.css']
  })
  export class TrainingPlansComponent implements OnInit {
    trainingPlans: TrainingPlan[] = [];
    newPlanName: string = ''; // Nazwa nowego planu
    showModal: boolean = false; // Kontrola widoczności formularza

    constructor(private userService: UserService, private authService: AuthService, private router: Router) {}

    ngOnInit(): void {
      this.loadTrainingPlans();
    }

    loadTrainingPlans(): void {
      const userId = this.authService.activeUser.id;
      this.userService.getTrainingPlansByUserId(userId).subscribe((data: TrainingPlan[]) => {
        this.trainingPlans = data;
      });
    }

    addTrainingPlan(): void {
      if (!this.newPlanName.trim()) return; // Zapobieganie pustej nazwie

      const userId = this.authService.activeUser.id;
      const newPlan: TrainingPlan = { name: this.newPlanName, userId }; // Tworzymy obiekt planu

      this.userService.createTrainingPlan(userId, newPlan).subscribe((createdPlan) => {
        this.trainingPlans.push(createdPlan);
        this.closeModal(); // Zamykamy modal po dodaniu
      });
    }

    openModal(): void {
      this.showModal = true;
    }

    closeModal(): void {
      this.showModal = false;
      this.newPlanName = ''; // Reset pola
    }
    viewPlanDetails(plan: TrainingPlan): void {
    this.router.navigate(['/individual-plan', plan.id]);
    }
    deletePlan(planId: number): void {
      this.userService.deleteTrainingPlan(planId).subscribe(() => {
        this.trainingPlans = this.trainingPlans.filter(p => p.id !== planId);
      }
      );
  }
  }
