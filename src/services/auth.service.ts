// auth.service.ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/services/user.service';
import { User } from 'src/models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated: boolean = false;
  activeUser: User | null = null;

  constructor(private router: Router, private userService: UserService) {
    const storedUser = localStorage.getItem('activeUser');
    if (storedUser) {
      this.isAuthenticated = true;
      this.activeUser = JSON.parse(storedUser);
    }
  }

  // Login method
  login(email: string, password: string) {
    const user = { email, password };
    console.log('Logging in:', user);

    // Wywołaj login w userService
    this.userService.login(email, password).subscribe(
      (response) => {
        // Zaktualizowana odpowiedź: bezpośrednie przypisanie tokenu i użytkownika
        const loggedInUser: any = response.user;  // Odpowiedź zawiera bezpośrednio użytkownika
        console.log('Logged in user:', loggedInUser);
        const token: string = response.token; // Z tokenem
        console.log('Token:', token);

        // Obsługujemy odpowiedź: zapisujemy dane użytkownika i token
        this.handleLoginResponse(loggedInUser, token);
        this.router.navigate(['/user-profile']);
      },
      (error) => {
        console.error('Login failed:', error);
        alert('Invalid email or password');
      }
    );
  }

  // Obsługuje odpowiedź z serwera po zalogowaniu
  handleLoginResponse(user: User, token: string) {
    // Zapisz dane użytkownika w activeUser
    this.activeUser = user;

    // Zapisz dane użytkownika i token w localStorage
    localStorage.setItem('activeUser', JSON.stringify(user));
    localStorage.setItem('token', token);

    // Ustaw stan zalogowanego użytkownika
    this.isAuthenticated = true;
  }

  // Logout method
  logout() {
    this.isAuthenticated = false;
    this.activeUser = null;
    localStorage.removeItem('activeUser');
    localStorage.removeItem('token'); // Zmiana na 'token'
    this.router.navigate(['/login']);
  }

  // Check if the user is logged in
  isLoggedIn(): boolean {
    return this.isAuthenticated;
  }
}
