// app.component.ts
import { Component } from '@angular/core';
import { AuthService } from 'src/services/auth.service';
import { User } from 'src/models/user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'FitnessApp';

  constructor(public authService: AuthService, private router: Router) {}

  login(user: User) {
    // Pass the full user object to the login method in AuthService
    this.authService.login(user.email, user.password);
  }

  logout() {
    this.authService.logout();
  }

  isAuthPage(): boolean {
    return this.router.url === '/login' || this.router.url === '/register';
  }
}
