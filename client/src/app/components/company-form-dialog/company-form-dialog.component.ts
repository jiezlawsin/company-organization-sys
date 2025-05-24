import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { Company } from '../../models/company.model';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-company-form-dialog',
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    DialogModule,
    ButtonModule,
  ],
  templateUrl: './company-form-dialog.component.html',
  styleUrl: './company-form-dialog.component.scss'
})
export class CompanyFormDialogComponent {
  @Input() visible: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() company: Company = this.getEmptyCompany();
  @Input() error: string = '';
  @Input() loading: boolean = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() save = new EventEmitter<Company>();

  getEmptyCompany(): Company {
    return {
      id: '',
      name: '',
    };
  }

  onHide() {
    this.visibleChange.emit(false);
  }

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.save.emit(this.company);
    }
  }
}
