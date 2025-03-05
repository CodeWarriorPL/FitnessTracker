import { Injectable } from '@angular/core';
import { User } from 'src/models/user';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = null
  private showNavbarSubject = null


  activeUser: User;

  constructor(private router: Router) {
    const storedUser = localStorage.getItem('activeUser');
    if (storedUser) {
      this.isAuthenticated = true;
      this.activeUser = JSON.parse(storedUser);
    }
  }

  login(user: User) {
    this.isAuthenticated = true;
    this.activeUser = user;
    localStorage.setItem('activeUser', JSON.stringify(user));
  }

  logout() {
    this.isAuthenticated = false;
    this.activeUser = null;


    localStorage.removeItem('activeUser');

    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }
}
