  import { Injectable } from '@angular/core';
  import { HttpClient } from '@angular/common/http';
  import { environment } from '../environments/environment';
  import { Observable, of } from 'rxjs';
  import { User } from '../models/user';
  import { Training } from '../models/training';  
  import { catchError, map, switchMap } from 'rxjs/operators'; // Import switchMap
  import { Set } from '../models/set';
  import { UserMeasurement } from 'src/models/userMeasurement';
  import { TrainingPlan } from 'src/models/trainingPlan';


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

    public getOneRepMaxHistory(userId: number, exerciseName): Observable<Object[]> {
      return this.http.get<Object[]>(`${this.apiUrl}/User/one-rep-max-history?userId=${userId}&exerciseName=${exerciseName}`);
    }

    public login(email: string, password: string): Observable<any> {
      return this.http.post<any>(`${this.apiUrl}/user/login`, { email, password });
    }

    register(user: { email: string, username: string, password: string }): Observable<any> {
      return this.http.post(`${this.apiUrl}/user/register`, user);
    }

    //TRAINING FUNCTIONS


    public getTrainings(userId: number): Observable<Training[]> {
      return this.http.get<Training[]>(`${this.apiUrl}/Training/${userId}`);
    }
    

    public getTrainingById(id: number): Observable<Training> {
      return this.http.get<Training>(`${this.apiUrl}/training/byId/${id}`);
    }
    
    public getTrainingByDate(userId: number, date: Date): Observable<Training | undefined> {
      return this.getTrainings(userId).pipe(
        map(trainings => 
          trainings.find(training => {
            const trainingDate = new Date(training.trainingDate);
            return (
              trainingDate.getFullYear() === date.getFullYear() &&
              trainingDate.getMonth() === date.getMonth() &&
              trainingDate.getDate() === date.getDate()
            );
          })
        )
      );
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
    public getTrainingWithSets(trainingId: number): Observable<{ [exerciseName: string]: Set[] }> {
      return this.http.get<{ [exerciseName: string]: Set[] }>(`${this.apiUrl}/training/sortedSets/${trainingId}`);
    }
    public deleteTrainingExercise(trainingId: number, exerciseId: number): Observable<void> {
      return this.http.delete<void>(`${this.apiUrl}/training/deleteExercise/${trainingId}/${exerciseId}`);
  }
  public updateTrainingName(trainingId: number, newName: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/training/updateTrainingName/${trainingId}/${encodeURIComponent(newName)}`, {});
  }
  createTrainingWithSets(userId: number, training: Training): Observable<Training> {
    return this.http.post<Training>(`${this.apiUrl}/training/createWithSets/${userId}`, training);
  }




    //set functions


    public getSets(trainingId: number): Observable<Set[]> {
      return this.http.get<Set[]>(`${this.apiUrl}/Set/${trainingId}`);
    }

    public getSetById(id: number): Observable<Set> {
      return this.http.get<Set>(`${this.apiUrl}/set/byId/${id}`);
    }
    public createSet(setId: number, newSet: Set,exercideId: number): Observable<Set> {
      return this.http.post<Set>(`${this.apiUrl}/set/${setId}/${exercideId}`, newSet);
    }
    public updateSet(updatedSet: Set): Observable<Set> { 
      return this.http.put<Set>(`${this.apiUrl}/set`, updatedSet);
    }
    public deleteSet(id: number): Observable<void> {
      return this.http.delete<void>(`${this.apiUrl}/set/${id}`);
    }
    public deleteSetsByExercise(exerciseId: number, trainingId : number): Observable<void> {
      return this.http.delete<void>(`${this.apiUrl}/set/byExercise/${trainingId}/${exerciseId}`);
    }
    public getUserSetsByExercise(userId : number, exerciseId : number) : Observable<Set[]> {
      return this.http.get<Set[]>(`${this.apiUrl}/set/byExercise/${userId}/${exerciseId}`);
    }
    public getSetsByTrainingExcercise(trainingId: number, exerciseId: number): Observable<Set[]> {
      return this.http.get<Set[]>(`${this.apiUrl}/set/byTrainingExercise/${trainingId}/${exerciseId}`);

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

    //userMeauserements function
    public getUserMeasurements(id:number): Observable<UserMeasurement[]> {
      return this.http.get<UserMeasurement[]>(`${this.apiUrl}/userMeasurement/${id}`);
    }
    public createUserMeasurement(userMeasurementId: number, newUserMeasurement: UserMeasurement): Observable<UserMeasurement> {
      return this.http.post<UserMeasurement>(`${this.apiUrl}/userMeasurement/${userMeasurementId}`, newUserMeasurement);
    }
    public updateUserMeasurements(userId: number, measurements: any[]): Observable<any> {
      // Upewnij się, że każdy pomiar ma przypisane poprawne userId
      measurements.forEach(m => m.userId1 = userId);
    
      return this.http.put(`${this.apiUrl}/userMeasurement/${userId}`, measurements);
    }
    public deleteUserMeasurement(measurementId: number): Observable<void> {
      return this.http.delete<void>(`${this.apiUrl}/userMeasurement/${measurementId}`);
    }
    public getTrainingPlans(userId: number): Observable<Training[]> {
      return this.http.get<Training[]>(`${this.apiUrl}/training/plans/${userId}`);
    }
    public getLatestUserMeasurement(userId: number): Observable<UserMeasurement> {
      return this.http.get<UserMeasurement>(`${this.apiUrl}/userMeasurement/latest/${userId}`);
    }

    //TrainingPlan functions
    
    public getTrainingPlansByUserId(userId: number): Observable<TrainingPlan[]> {
      return this.http.get<TrainingPlan[]>(`${this.apiUrl}/trainingPlan/${userId}`);
    }
    
    public getTrainingPlanById(id: number): Observable<TrainingPlan> {
      return this.http.get<TrainingPlan>(`${this.apiUrl}/trainingPlan/plan/${id}`);

    }
    
    public createTrainingPlan(userId: number, newTrainingPlan: TrainingPlan): Observable<TrainingPlan> {
      return this.http.post<TrainingPlan>(`${this.apiUrl}/trainingPlan/${userId}`, newTrainingPlan);
    }
    
    public updateTrainingPlan(id: number, updatedTrainingPlan: TrainingPlan): Observable<TrainingPlan> {
      return this.http.put<TrainingPlan>(`${this.apiUrl}/trainingPlan/${id}`, updatedTrainingPlan);
    }
    
    public deleteTrainingPlan(id: number): Observable<void> {
      return this.http.delete<void>(`${this.apiUrl}/trainingPlan/${id}`);
    }
    public getAllPlanTrainigs(planId: number): Observable<Training[]> {
      return this.http.get<Training[]>(`${this.apiUrl}/trainingPlan/all/${planId}`);
    }

    public getAverageOneRepMax(exerciseName: string): Observable<Object[]> {
      return this.http.get<Object[]>(`${this.apiUrl}/exercisestats/average-one-rep-max?exerciseName=${exerciseName}`);
    }
    
    
    
    

  }

    

