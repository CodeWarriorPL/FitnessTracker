import { Component } from '@angular/core';
import { UserService } from 'src/services/user.service';
import { Router } from '@angular/router';
import { User } from 'src/models/user';
import { AuthService } from 'src/services/auth.service';
import { take, switchMap } from 'rxjs/operators';
import { Training } from 'src/models/training';
import { EMPTY } from 'rxjs';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  constructor(private userService: UserService, private router: Router,private authService: AuthService,private datePipe: DatePipe) {}
  userData = {
    email : '',
    username: '',
    password: '',
  };
  userTrainingData = { 
    
  

   
  }
  
  loginError : boolean;
  



// ...

 onSubmit() {
  this.userService.getUserId(this.userData.email).subscribe(
    (userId: number | null) => {
      if (userId !== null) {
        // If userId is not null, get the user by ID
        this.userService.getUserById(userId).subscribe(
          (response: User) => {
            if (response.password === this.userData.password) {
              
              this.authService.login(response);
              this.router.navigate(['/user-profile']);
             
              
            } else {
              alert('Wrong password!');
              console.log(response.password);
            }
          },
          (error) => {
            console.error('Error retrieving user by ID:', error);
          }
        );
      } else {
        alert('User not found!');
      }
    },
    (error) => {
      console.error('Error retrieving user ID by email:', error);
    }
  );
  }
}


