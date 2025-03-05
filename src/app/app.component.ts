import { Component } from '@angular/core';
import { AuthService } from 'src/services/auth.service';
import { User } from 'src/models/user';
import { NgxEchartsDirective, provideEcharts } from 'ngx-echarts';
import { Router } from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [provideEcharts( )],
  
})
export class AppComponent {
  title = 'FitnessApp';
  constructor(public authService: AuthService,private router: Router) {}
  login(user: User) {
    this.authService.login(user);
  }
  logout() {
    this.authService.logout();
  }
  isAuthPage(): boolean {
    return this.router.url === '/login' || this.router.url === '/register';
  }
}
