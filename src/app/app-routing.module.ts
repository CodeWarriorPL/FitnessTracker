
import { NgModule, Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthGuard } from './guard/auth.guard';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { MyTrainingsComponent } from './components/my-trainings/my-trainings.component';
import { TrainingPlansComponent } from './components/training-plans/training-plans.component';
import { IndividualTrainingComponent } from './components/individual-training/individual-training.component';
import { IndividualPlanComponent } from './components/individual-plan/individual-plan.component';
import { TrainingProgressComponent } from './components/training-progress/training-progress.component';
const routes: Routes = [
  {path: 'user-profile', component:UserProfileComponent,canActivate:[AuthGuard]},
  {path: 'training-plans', component: TrainingPlansComponent, canActivate: [AuthGuard]},
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'my-trainings', component: MyTrainingsComponent, canActivate: [AuthGuard]},
  {path: 'individual-training/:id', component: IndividualTrainingComponent, canActivate: [AuthGuard]},
  {path: 'individual-plan/:id', component: IndividualPlanComponent, canActivate: [AuthGuard]},
  {path: 'progress', component: TrainingProgressComponent, canActivate: [AuthGuard]},
  { path: '', redirectTo: '/user-profile', pathMatch: 'full' },
  { path: '**', redirectTo: '/user-profile', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
