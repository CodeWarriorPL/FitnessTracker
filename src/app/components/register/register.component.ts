import { Component } from '@angular/core';
import { UserService } from 'src/services/user.service';
import { Router } from '@angular/router';
import { User } from 'src/models/user';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  constructor(private userService: UserService, private router: Router) {}

  isEmailUnique : boolean;

  userData: User = {
    username: '',
    email: '',
    password: '',
  };
  


  // Regular expression for email validation
  emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

  onSubmit(): void {
    // Check if the email is valid before submitting
    if (this.isValidEmail(this.userData.email)) {
      // Check if the password meets the criteria
      if (this.isPasswordValid(this.userData.password)) {
        // Check if the email is not already in the database
        this.userService.checkEmailUnique(this.userData.email).subscribe(
          (isUnique: boolean) => {
            if (isUnique) {
              // Add user to the database if email is unique
              this.userService.addUser(this.userData).subscribe(
                (response: User) => {
                  this.router.navigate(['/login']);
                  
                },
                (error) => {
                  console.error('Error adding user:', error);
                }
              );
            } else {
              console.error('Email is already in use');
              // You can display a message to the user or handle it as needed
            }
          },
          (error) => {
            console.error('Error checking email uniqueness:', error);
          }
        );
      } else {
        console.error('Invalid password format');
        // You can display a message to the user or handle it as needed
      }
    } else {
      console.error('Invalid email format');
      // You can display a message to the user or handle it as needed
    }
  }

  // Method to check if the email is valid
  isValidEmail(email: string): boolean {
    return this.emailRegex.test(email);
  }

  // Method to check if the password meets the criteria (at least 6 characters and 1 digit)
  isPasswordValid(password: string): boolean {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    return passwordRegex.test(password);
  }
}
