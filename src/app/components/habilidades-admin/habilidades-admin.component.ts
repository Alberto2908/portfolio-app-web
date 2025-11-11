import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HabilidadesService } from '../../services/habilidades.service';
import { Habilidad } from '../../models/habilidad.model';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-habilidades-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './habilidades-admin.component.html',
  styleUrls: ['./habilidades-admin.component.css']
})
export class HabilidadesAdminComponent {
  form: FormGroup;
  loading = false;
  uploading = false;
  imageError = false;
  imageFile?: File;
  imageFileName: string = '';
  previewUrl: string | null = null;
  dragOver = false;
  editing = false;
  currentId: string | null = null;
  private loadingSwalTimer: any = null;

  categorias = [
    { value: 'frontend', label: 'Frontend' },
    { value: 'backend', label: 'Backend' },
    { value: 'database', label: 'Base de Datos' },
    { value: 'tools', label: 'Herramientas' },
    { value: 'other', label: 'Otros' },
  ];


  constructor(private fb: FormBuilder, private habilidades: HabilidadesService, private router: Router, private route: ActivatedRoute) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(60)]],
      image: ['', [Validators.required]],
      category: ['frontend', [Validators.required]]
    });

    // Detect edit mode
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editing = true;
      this.currentId = id;
      this.loading = true;
      this.habilidades.getById(id).subscribe({
        next: (h) => {
          this.form.patchValue({
            name: h.name,
            image: h.image,
            category: h.category
          });
          // Setup preview if image exists
          if (h.image) {
            const normalized = h.image.startsWith('/uploads') ? `${environment.apiUrl}${h.image}` : h.image;
            this.previewUrl = normalized;
            this.imageFileName = h.image.split('/').pop() || h.image;
          }
          this.loading = false;
        },
        error: (err) => {
          console.error('Error cargando habilidad', err);
          this.loading = false;
        }
      });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files && input.files.length ? input.files[0] : undefined;
    if (!file) {
      this.imageError = true;
      this.imageFile = undefined;
      this.previewUrl = null;
      this.imageFileName = '';
      this.form.patchValue({ image: '' });
      return;
    }
    const isImage = file.type.startsWith('image/');
    const maxSizeMb = 5;
    const valid = isImage && file.size <= maxSizeMb * 1024 * 1024;
    this.imageError = !valid;
    if (valid) {
      this.imageFile = file;
      this.imageFileName = file.name;
      this.form.patchValue({ image: file.name });
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    } else {
      this.imageFile = undefined;
      this.previewUrl = null;
      this.imageFileName = '';
      this.form.patchValue({ image: '' });
    }
  }

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    this.dragOver = true;
  }

  onDragLeave(e: DragEvent): void {
    e.preventDefault();
    this.dragOver = false;
  }

  onDrop(e: DragEvent): void {
    e.preventDefault();
    this.dragOver = false;
    if (!e.dataTransfer || !e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
    const file = e.dataTransfer.files[0];
    const fakeEvent = { target: { files: [file] } } as unknown as Event;
    this.onFileSelected(fakeEvent);
  }

  clearImage(e?: Event): void {
    if (e) { e.stopPropagation(); }
    this.imageFile = undefined;
    this.previewUrl = null;
    this.imageFileName = '';
    this.imageError = false;
    this.form.patchValue({ image: '' });
  }

  submit(): void {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;

    // Debounced loading modal to avoid flicker if operation is fast
    if (this.loadingSwalTimer) { clearTimeout(this.loadingSwalTimer); }
    this.loadingSwalTimer = setTimeout(() => {
      Swal.fire({
        title: 'Guardando...',
        text: 'Estamos guardando la información',
        showConfirmButton: false,
        allowOutsideClick: false,
        icon: undefined as any,
        customClass: {
          popup: 'swal-portfolio-popup',
          title: 'swal-portfolio-title',
          confirmButton: 'swal-portfolio-confirm',
          actions: 'swal-portfolio-actions'
        }
      });
    }, 300);

    const finalizeCreateOrUpdate = () => {
      const body: Habilidad = this.form.value as Habilidad;
      const obs = this.editing && this.currentId ? this.habilidades.update(this.currentId, body) : this.habilidades.create(body);
      obs.subscribe({
        next: () => {
          this.loading = false;
          this.uploading = false;
          // Clear potential loading modal
          if (this.loadingSwalTimer) { clearTimeout(this.loadingSwalTimer); this.loadingSwalTimer = null; }
          if (Swal.isVisible()) { Swal.close(); }
          const successTitle = this.editing ? 'Habilidad actualizada' : 'Habilidad guardada';
          if (this.editing) {
            // Keep values but clear temp states
            this.imageFile = undefined;
          } else {
            this.form.reset({ category: 'frontend' });
            this.imageFile = undefined;
            this.previewUrl = null;
            this.imageFileName = '';
          }
          Swal.fire({
            title: successTitle,
            text: this.editing ? 'Los cambios se han guardado correctamente.' : 'La habilidad se ha creado correctamente.',
            icon: 'success',
            customClass: {
              popup: 'swal-portfolio-popup',
              title: 'swal-portfolio-title',
              confirmButton: 'swal-portfolio-confirm',
              actions: 'swal-portfolio-actions'
            }
          }).then(() => {
            this.router.navigate(['/portfolio']);
          });
        },
        error: (err) => {
          console.error('Error guardando habilidad', err);
          this.loading = false;
          this.uploading = false;
          if (this.loadingSwalTimer) { clearTimeout(this.loadingSwalTimer); this.loadingSwalTimer = null; }
          if (Swal.isVisible()) { Swal.close(); }
          Swal.fire({
            title: 'Error al guardar',
            text: 'No se ha podido guardar la habilidad. Inténtalo de nuevo.',
            icon: 'error',
            customClass: {
              popup: 'swal-portfolio-popup',
              title: 'swal-portfolio-title',
              confirmButton: 'swal-portfolio-confirm',
              actions: 'swal-portfolio-actions'
            }
          });
        }
      });
    };

    if (this.imageFile) {
      this.uploading = true;
      this.habilidades.upload(this.imageFile).subscribe({
        next: (res) => {
          this.form.patchValue({ image: res.url });
          finalizeCreateOrUpdate();
        },
        error: (err) => {
          console.error('Error subiendo imagen', err);
          this.uploading = false;
          this.loading = false;
          this.imageError = true;
          if (this.loadingSwalTimer) { clearTimeout(this.loadingSwalTimer); this.loadingSwalTimer = null; }
          if (Swal.isVisible()) { Swal.close(); }
          Swal.fire({
            title: 'Error al subir imagen',
            text: 'Revisa el archivo e inténtalo de nuevo.',
            icon: 'error',
            customClass: {
              popup: 'swal-portfolio-popup',
              title: 'swal-portfolio-title',
              confirmButton: 'swal-portfolio-confirm',
              actions: 'swal-portfolio-actions'
            }
          });
        }
      });
    } else {
      finalizeCreateOrUpdate();
    }
  }

  salir(): void {
    this.router.navigate(['/portfolio']);
  }
}
