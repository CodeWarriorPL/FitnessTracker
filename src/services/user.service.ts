import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable, of } from 'rxjs';
import { User } from '../models/user';
import { Training } from '../models/training';  
import { catchError, map, switchMap } from 'rxjs/operators'; // Import switchMap

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = environment.apiBaseUrl;
  private users: User[] = [];

  constructor(private http: HttpClient) {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.http.get<User[]>(`${this.apiUrl}/user`).subscribe(
      (users: User[]) => {
        this.users = users;
      },
      (error) => {
        console.error('Error loading users:', error);
      }
    );
  }

  public getUser(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/user`);
  }

  public addUser(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/user`, user);
  }

  public getUserById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/user/${id}`);
  }

  public updateUser(user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/user`, user);
  }

  public deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/user/${id}`);
  }

  public checkEmailUnique(email: string): Observable<boolean> {
    const isEmailUnique = !this.users.some((user) => user.email === email);
    return new Observable<boolean>((observer) => {
      observer.next(isEmailUnique);
      observer.complete();
    });
  }
  public getUserId(email: string): Observable<number | null> {
    return this.getUser().pipe(
      map((users) => users.find((user) => user.email === email)),
      map((user) => (user ? user.id : null)),
      catchError(() => of(null))
    );
  }

  //TRAINING FUNCTIONS


  public getTrainings(userId: number): Observable<Training[]> {
    return this.http.get<Training[]>(`${this.apiUrl}/Training/${userId}`);
  }

  public getTrainingById(id: number): Observable<Training> {
    return this.http.get<Training>(`${this.apiUrl}/training/byId/${id}`);
  }

  public createTraining(trainingId: number, newTraining: Training): Observable<Training> {
    return this.http.post<Training>(`${this.apiUrl}/training/${trainingId}`, newTraining);
  }

  public updateTraining(updatedTraining: Training): Observable<Training> {
    return this.http.put<Training>(`${this.apiUrl}/training`, updatedTraining);
  }

  public deleteTraining(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/training/${id}`);
  }

  //set functions


  public getSets(trainingId: number): Observable<Training[]> {
    return this.http.get<Training[]>(`${this.apiUrl}/Set/${trainingId}`);
  }

  public getSetById(id: number): Observable<Training> {
    return this.http.get<Training>(`${this.apiUrl}/set/byId/${id}`);
  }
  public createSet(setId: number, newSet: Training,exercideId: number): Observable<Training> {
    return this.http.post<Training>(`${this.apiUrl}/set/${setId}/${exercideId}`, newSet);
  }
  public updateSet(updatedSet: Training): Observable<Training> { 
    return this.http.put<Training>(`${this.apiUrl}/set`, updatedSet);
  }
  public deleteSet(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/set/${id}`);
  }
  public deleteSetsByExercise(exerciseId: number, trainingId : number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/set/byExercise/${trainingId}/${exerciseId}`);
  }


  //exercise functions


  public getExercises(): Observable<Training[]> {
    return this.http.get<Training[]>(`${this.apiUrl}/Exercise`);
  }
  public getExerciseById(id: number): Observable<Training> {
    return this.http.get<Training>(`${this.apiUrl}/exercise/byId/${id}`);
  }
  public createExercise(exerciseId: number, newExercise: Training): Observable<Training> {
    return this.http.post<Training>(`${this.apiUrl}/exercise/${exerciseId}`, newExercise);
  }
  public updateExercise(updatedExercise: Training): Observable<Training> {
    return this.http.put<Training>(`${this.apiUrl}/exercise`, updatedExercise);
  }
  public deleteExercise(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/exercise/${id}`);
  }
  public getExerciseName(exerciseId: number): Observable<Training[]> {
    return this.http.get<Training[]>(`${this.apiUrl}/exercise/Name/${exerciseId}`);
  }

}

  

