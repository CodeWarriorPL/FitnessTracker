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
  // Injecting necessary services for user registration and routing
  constructor(private userService: UserService, private router: Router) {}

  isEmailUnique: boolean = true;  // Flag to indicate if email is unique
  errorMessage: string = '';  // For displaying error messages
  
  userData: any = {
    id: 0,
    username: '',
    email: '',
    password: '',
  };

  // Regular expression for email validation
  emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

  // Method to handle form submission
  onSubmit(): void {
    console.log('Registering user:', this.userData);
    // Validate email format
    if (this.isValidEmail(this.userData.email)) {
      console.log('Email is valid');
      // Validate password format
      if (this.isPasswordValid(this.userData.password)) {
        console.log('Password is valid');
        // Check if the email is unique
        this.userService.checkEmailUnique(this.userData.email).subscribe(
          (isUnique: boolean) => {
            if (isUnique) {
              // Proceed to register the user if the email is unique
              this.userService.register(this.userData).subscribe(
                (response) => {
                  console.log('Registration successful:', response);
                  this.router.navigate(['/login']); // Navigate to login after successful registration
                },
                (error) => {
                  this.errorMessage = 'Error during registration. Please try again.';
                  console.error('Error during registration:', error);
                }
              );
            } else {
              this.errorMessage = 'Email is already in use.';
            }
          },
          (error) => {
            this.errorMessage = 'Error checking email uniqueness. Please try again.';
            console.error('Error checking email uniqueness:', error);
          }
        );
      } else {
        this.errorMessage = 'Password must be at least 6 characters long and contain at least one digit.';
      }
    } else {
      this.errorMessage = 'Invalid email format.';
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
