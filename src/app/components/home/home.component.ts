
// home.component.ts

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/services/auth.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  constructor(private router: Router, private authService : AuthService ) { }

  
    activeUser = this.authService.activeUser;
    selectedFeature: string = ''; // Track the selected feature


    changeContent(featureName: string): void {
      this.selectedFeature = featureName;
      this.router.navigate(["/trainings"]);
    }
    
  
}
