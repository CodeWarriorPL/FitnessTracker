import { Injectable } from '@angular/core';
import { User } from 'src/models/user';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated: boolean = false;
  activeUser: User;

  constructor(private router: Router) {
    // Check for stored authentication state during service initialization
    const storedUser = localStorage.getItem('activeUser');
    if (storedUser) {
      this.isAuthenticated = true;
      this.activeUser = JSON.parse(storedUser);
    }
  }

  login(user: User) {
    this.isAuthenticated = true;
    this.activeUser = user;

    // Store user information in localStorage
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
