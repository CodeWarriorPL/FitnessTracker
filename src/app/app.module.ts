import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { FormsModule } from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import { HomeComponent } from './components/home/home.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { TrainingsComponent } from './components/trainings/trainings.component';
import { DatePipe } from '@angular/common';
import { TrainingSectionComponent } from './components/training-section/training-section.component';
import {MatIconModule} from '@angular/material/icon';
import { AddSetComponent } from './components/add-set/add-set.component'
import {MatDialogModule} from '@angular/material/dialog';
import {MatCalendar, MatDatepickerModule} from '@angular/material/datepicker';
import { DateAdapter, MatOptionModule } from '@angular/material/core';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCalendarCellClassFunction } from '@angular/material/datepicker';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import { ChooseExerciseComponent } from './components/choose-exercise/choose-exercise.component';


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    NavbarComponent,
    TrainingsComponent,
    TrainingSectionComponent,
    AddSetComponent,
    ChooseExerciseComponent,
    
    
  
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    MatIconModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule


 

  ],
  providers: [DatePipe],
  bootstrap: [AppComponent]
})
export class AppModule { }
