
import { NgModule, Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent} from './components/home/home.component';
import { TrainingsComponent } from './components/trainings/trainings.component';
import { ProgressChartComponent } from './components/progress-chart/progress-chart.component';
import { TrainingTemplateComponent } from './components/training-template/training-template.component';
import { AuthGuard } from './guard/auth.guard';
const routes: Routes = [
  {path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'progress-chart/:exerciseId/:exerciseName', component: ProgressChartComponent,canActivate: [AuthGuard]},
  {path: 'trainings', component: TrainingsComponent, canActivate: [AuthGuard]},
  {path: 'templates',component: TrainingTemplateComponent,canActivate: [AuthGuard]},
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
