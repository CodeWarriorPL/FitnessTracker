// login.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth.service';
import { User } from 'src/models/user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  userData = {
    id: 0,
    email: '',
    username: 'string',
    password: '',
  };

  loginError: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    const { email, password } = this.userData;
    console.log('this.userData:', this.userData);

    this.authService.login(email, password); // Calls AuthService which in turn calls UserService
  }
}
