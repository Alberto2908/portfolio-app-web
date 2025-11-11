import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ContactMessageService } from '../../services/contact-message.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-contacta-conmigo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule
  ],
  templateUrl: './contacta-conmigo.component.html',
  styleUrls: ['./contacta-conmigo.component.css']
})
export class ContactaConmigoComponent {
  contactForm: FormGroup;
  loading = false;
  private locClickCount = 0;

  @ViewChild('locationIcon', { static: false }) locationIcon?: ElementRef<HTMLElement>;

  contactInfo = {
    email: 'alberto.cabello95@gmail.com',
    phone: '+34 637 83 94 46',
    location: 'Madrid, España',
    github: 'https://github.com/Alberto2908',
    linkedin: 'https://www.linkedin.com/in/alberto-cabello-lasheras/'
  };

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private contactService: ContactMessageService,
    private router: Router,
    private translate: TranslateService
  ) {
    this.contactForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required]],
      message: ['', [Validators.required]]
    });
  }

  onLocationClick(): void {
    this.locClickCount++;
    if (this.locClickCount >= 5) {
      this.locClickCount = 0;
      this.router.navigate(['/login']);
    }
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent): void {
    const iconEl = this.locationIcon?.nativeElement;
    const target = event.target as Node | null;
    if (!iconEl || !target) {
      this.locClickCount = 0;
      return;
    }
    // If click target is NOT the icon itself, reset counter
    if (!iconEl.contains(target)) {
      this.locClickCount = 0;
    }
  }

  downloadCV(): void {
    const link = document.createElement('a');
    link.href = 'cv/Alberto Cabello Lasheras.pdf';
    link.download = 'Alberto Cabello Lasheras.pdf';
    link.click();
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      const formData = this.contactForm.value;
      this.loading = true;
      Swal.fire({
        title: this.translate.instant('contact.sending_title'),
        text: this.translate.instant('contact.sending_text'),
        allowOutsideClick: false,
        background: '#0b0b12',
        color: '#f5f3ff',
        showConfirmButton: false,
        customClass: {
          popup: 'swal-portfolio-popup',
          title: 'swal-portfolio-title',
          htmlContainer: 'swal-portfolio-html',
          actions: 'swal-portfolio-actions'
        }
      });
      this.contactService.create({
        email: formData.email,
        asunto: formData.subject,
        mensaje: formData.message
      }).subscribe({
        next: _ => {
          Swal.close();
          Swal.fire({
            icon: 'success',
            title: this.translate.instant('contact.success_title'),
            text: this.translate.instant('contact.success_text'),
            background: '#0b0b12',
            color: '#f5f3ff',
            customClass: {
              popup: 'swal-portfolio-popup',
              title: 'swal-portfolio-title',
              htmlContainer: 'swal-portfolio-html',
              actions: 'swal-portfolio-actions'
            },
            confirmButtonText: this.translate.instant('contact.accept_button')
          });
          this.contactForm.reset();
          this.loading = false;
        },
        error: err => {
          console.error(err);
          Swal.close();
          Swal.fire({
            icon: 'error',
            title: this.translate.instant('contact.error_title'),
            text: this.translate.instant('contact.error_text'),
            background: '#0b0b12',
            color: '#f5f3ff',
            customClass: {
              popup: 'swal-portfolio-popup',
              title: 'swal-portfolio-title',
              htmlContainer: 'swal-portfolio-html',
              actions: 'swal-portfolio-actions'
            },
            confirmButtonText: this.translate.instant('contact.understood_button')
          });
          this.loading = false;
        }
      });
    } else {
      Object.values(this.contactForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
}
