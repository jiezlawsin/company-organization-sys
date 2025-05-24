import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CompanyService } from '../../services/company.service';
import { Company } from '../../models/company.model';
import { CompanyFormDialogComponent } from '../../components/company-form-dialog/company-form-dialog.component';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [
    CommonModule,
    CompanyFormDialogComponent,
    FormsModule,
    CardModule,
    ButtonModule,
    AvatarModule,
    AvatarGroupModule
  ],
  templateUrl: './companies.component.html',
  styleUrl: './companies.component.scss'
})
export class CompaniesComponent implements OnInit {
  companies: Company[] = [];
  isEditMode: boolean = false;
  showDialog: boolean = false;
  formLoading: boolean = false;
  newCompany: Company = { id: '', name: '' };
  companyFormError: string = '';

  constructor(private companyService: CompanyService, private router: Router) { }

  ngOnInit() {
    this.loadCompanies();
  }

  loadCompanies() {
    this.companyService.getCompanies().subscribe({
      next: (companies) => this.companies = companies,
      error: (err) => console.error('Error loading companies:', err)
    })
  }

  getInitial(company: Company): string {
    return company.name ? company.name.charAt(0).toUpperCase() : '';
  }

  openDialog() {
    this.showDialog = true;
    this.isEditMode = false;
    this.newCompany = { id: '', name: '' };
    this.companyFormError = '';
  }

  isDuplicateCompanyName(name: string): boolean {
    return this.companies.some(company => company.name.toLowerCase() === name.toLowerCase());
  }

  onSaveCompany(company: Company) {
    this.formLoading = true;
    this.companyFormError = '';

    if (this.isDuplicateCompanyName(company.name)) {
      this.companyFormError = 'Company name already exists';
      return;
    }

    if (company.id) {
    } else {
      this.companyService.addCompany(company).subscribe({
        next: (company) => {
          this.showDialog = false;
          this.formLoading = false;
          this.loadCompanies();
        },
        error: (err) => {
          this.formLoading = false;
          console.error('Error adding company:', err);
        }
      });
    }
  }

  goToEmployees(companyId: string) {
    this.router.navigate(['/companies', companyId, 'employees']);
  }
}
