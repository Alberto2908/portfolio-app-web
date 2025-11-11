import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ExperienciasService } from '../../services/experiencias.service';
import { Experiencia } from '../../models/experiencia.model';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-experiencia-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './experiencia-admin.component.html',
  styleUrls: ['./experiencia-admin.component.css']
})
export class ExperienciaAdminComponent {
  form: FormGroup;
  loading = false;
  editing = false;
  currentId: string | null = null;
  private loadingSwalTimer: any = null;

  meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  constructor(
    private fb: FormBuilder,
    private experienciasService: ExperienciasService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      empresa: ['', [Validators.required, Validators.maxLength(100)]],
      puesto: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: ['', [Validators.required, Validators.maxLength(500)]],
      mesInicio: ['', [Validators.required]],
      anoInicio: [new Date().getFullYear(), [Validators.required]],
      trabajoActivo: [false, [Validators.required]],
      mesFin: [''],
      anoFin: [null]
    });

    // Detect edit mode
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editing = true;
      this.currentId = id;
      this.loading = true;
      this.experienciasService.getById(id).subscribe({
        next: (exp) => {
          this.form.patchValue({
            empresa: exp.empresa,
            puesto: exp.puesto,
            descripcion: exp.descripcion,
            mesInicio: exp.mesInicio,
            anoInicio: exp.anoInicio,
            trabajoActivo: exp.trabajoActivo,
            mesFin: exp.mesFin || '',
            anoFin: exp.anoFin || null
          });
          this.loading = false;
        },
        error: (err) => {
          console.error('Error cargando experiencia', err);
          this.loading = false;
        }
      });
    }

    // Watch trabajoActivo to conditionally require mesFin/anoFin
    this.form.get('trabajoActivo')?.valueChanges.subscribe((activo) => {
      if (activo) {
        this.form.get('mesFin')?.clearValidators();
        this.form.get('anoFin')?.clearValidators();
      } else {
        this.form.get('mesFin')?.setValidators([Validators.required]);
        this.form.get('anoFin')?.setValidators([Validators.required]);
      }
      this.form.get('mesFin')?.updateValueAndValidity();
      this.form.get('anoFin')?.updateValueAndValidity();
    });
  }

  submit(): void {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;

    // Debounced loading modal
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

    const body: Experiencia = this.form.value as Experiencia;
    const obs = this.editing && this.currentId
      ? this.experienciasService.update(this.currentId, body)
      : this.experienciasService.create(body);

    obs.subscribe({
      next: () => {
        this.loading = false;
        if (this.loadingSwalTimer) { clearTimeout(this.loadingSwalTimer); this.loadingSwalTimer = null; }
        if (Swal.isVisible()) { Swal.close(); }

        const successTitle = this.editing ? 'Experiencia actualizada' : 'Experiencia guardada';
        const successText = this.editing
          ? 'Los cambios se han guardado correctamente.'
          : 'La experiencia se ha creado correctamente.';

        if (!this.editing) {
          this.form.reset({
            anoInicio: new Date().getFullYear(),
            trabajoActivo: false
          });
        }

        Swal.fire({
          title: successTitle,
          text: successText,
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
        console.error('Error guardando experiencia', err);
        this.loading = false;
        if (this.loadingSwalTimer) { clearTimeout(this.loadingSwalTimer); this.loadingSwalTimer = null; }
        if (Swal.isVisible()) { Swal.close(); }

        Swal.fire({
          title: 'Error al guardar',
          text: 'No se ha podido guardar la experiencia. Inténtalo de nuevo.',
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
  }

  salir(): void {
    this.router.navigate(['/portfolio']);
  }
}
