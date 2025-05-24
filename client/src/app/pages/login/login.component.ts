import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CompanyService } from '../../services/company.service';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    CommonModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    ProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  companyName: string = '';
  errorMessage: string = '';
  loading: boolean = false;

  constructor(private authService: AuthService, private companyService: CompanyService, private router: Router) {
    const credentials = this.authService.getUser();
    this.email = credentials.email;
    this.password = credentials.password;
  }

  login() {
    console.log('Attempting to log in with:', this.email, this.password);
    this.loading = true;
    this.errorMessage = '';

    setTimeout(() => {
      if (this.authService.login(this.email, this.password)) {
        console.log('Login successful, navigating to home page');
        this.router.navigate(['/']);
      } else {
        this.errorMessage = 'Invalid email or password';
      }
      this.loading = false;
    }, 2000); // Simulate a delay for loading
  }
}
