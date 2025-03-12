import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserProfileComponent } from './user-profile.component';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth.service';
import { UserService } from 'src/services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatNativeDateModule } from '@angular/material/core';
import { DateAdapter, NativeDateAdapter } from '@angular/material/core';
import { NgApexchartsModule } from 'ng-apexcharts';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';

describe('UserProfileComponent', () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;
  let authServiceMock: any;
  let userServiceMock: any;
  let routerMock: any;
  let dialogMock: any;

  beforeEach(async () => {
    authServiceMock = {
      activeUser: { id: 1, name: 'Test User' }
    };

    userServiceMock = {
      getTrainingPlansByUserId: jasmine.createSpy().and.returnValue(of([])),
      getTrainings: jasmine.createSpy().and.returnValue(of([])),
      getUserMeasurements: jasmine.createSpy().and.returnValue(of([])),
    };

    routerMock = { navigate: jasmine.createSpy() };
    dialogMock = { open: jasmine.createSpy().and.returnValue({ afterClosed: () => of(null) }) };

    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MatNativeDateModule,
        NgApexchartsModule,
        FormsModule
      ],
      declarations: [UserProfileComponent],
      providers: [    
        { provide: AuthService, useValue: authServiceMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: DateAdapter, useClass: NativeDateAdapter },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load training plans on init', () => {
    expect(userServiceMock.getTrainingPlansByUserId).toHaveBeenCalledWith(1);
  });

  it('should call getUserMeasurements and update chart on init', () => {
    expect(userServiceMock.getUserMeasurements).toHaveBeenCalledWith(1);
  });

  it('should navigate to training page on onClick', () => {
    component.onClick('training');
    expect(routerMock.navigate).toHaveBeenCalledWith(['/training']);
  });

  /*** TESTY SZYBKOŚCI ***/

  function measureExecutionTime(fn: () => void, description: string, done: DoneFn, maxTime = 500) {
    const start = performance.now();
    fn();
    const end = performance.now();
    const executionTime = end - start;
    console.log(`${description} took: ${executionTime.toFixed(2)} ms`);
    expect(executionTime).toBeLessThan(maxTime);
    done();
  }

  it('should measure time to fetch training plans', (done) => {
    measureExecutionTime(() => {
      userServiceMock.getTrainingPlansByUserId(1).subscribe();
    }, 'Fetching training plans', done);
  });

  it('should measure time to fetch user measurements', (done) => {
    measureExecutionTime(() => {
      userServiceMock.getUserMeasurements(1).subscribe();
    }, 'Fetching user measurements', done);
  });
});
