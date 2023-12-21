import { Component } from '@angular/core';
import { AuthService } from 'src/services/auth.service';
import { User } from 'src/models/user';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'FitnessApp';
  constructor(public authService: AuthService) {}
  login(user: User) {
    this.authService.login(user);
  }
  logout() {
    this.authService.logout();
  }
}
