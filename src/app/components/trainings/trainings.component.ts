import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from './../../../services/auth.service';
import { Router } from '@angular/router';
import { UserService } from 'src/services/user.service';
import { Training } from 'src/models/training';
import { MatFormField } from '@angular/material/form-field';
import { ViewEncapsulation } from '@angular/core';
import { MatOption } from '@angular/material/core';

@Component({
  selector: 'app-addtraining',
  templateUrl: './trainings.component.html',
  styleUrls: ['./trainings.component.css'],
})
export class TrainingsComponent {
  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router : Router,

  ) {}

  trainings: Training[] = [];
  activeUser = this.authService.activeUser;
  defaultDate: Date = new Date();
  dateSelected : boolean = false;
  templateSelected = false;
  training : Training = {
    id: 0,
    trainingDate: new Date(),
    name : '',

  }

  // Get trainings
  ngOnInit() {
    this.getTrainings();

  }
  selectDate(dateObject) {
    this.dateSelected = true
   
    this.training.trainingDate = dateObject.value;
    this.training.trainingDate.setHours(12,0,0,0);
    console.log(dateObject.value)
  }
  
  selectTemplate() {
   this.templateSelected = true
  }

    
    addTraining() {
      this.userService.createTraining(this.activeUser.id, this.training).subscribe(
        (data: Training) => {
          this.trainings.push(data);
          this.getTrainings(); 
        },
        (error) => {
          console.error('Wystąpił błąd podczas dodawania treningu:', error);
        }
      );
     
      console.log(this.trainings);
      }
      addTemplate() {
        this.router.navigate(['/templates']);
      }
    
    
    
  
  getTrainings() {
    this.userService.getTrainings(this.activeUser.id).subscribe(
      (data: Training[]) => {
        this.trainings = data; 
      },
      (error) => {
        console.error('Wystąpił błąd podczas pobierania treningów:', error);
      }
    );
  }

 

  
  
}
