import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormacionesService } from '../../services/formaciones.service';
import { Formacion } from '../../models/formacion.model';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-formacion-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formacion-admin.component.html',
  styleUrls: ['./formacion-admin.component.css']
})
export class FormacionAdminComponent {
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
    private formacionesService: FormacionesService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(150)]],
      centro: ['', [Validators.required, Validators.maxLength(150)]],
      mesInicio: ['', [Validators.required]],
      anoInicio: [new Date().getFullYear(), [Validators.required]],
      cursandoAhora: [false, [Validators.required]],
      mesFin: [''],
      anoFin: [null]
    });

    // Detect edit mode
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.editing = true;
      this.currentId = id;
      this.loading = true;
      this.formacionesService.getById(id).subscribe({
        next: (f) => {
          this.form.patchValue({
            nombre: f.nombre,
            centro: f.centro,
            mesInicio: f.mesInicio,
            anoInicio: f.anoInicio,
            cursandoAhora: f.cursandoAhora,
            mesFin: f.mesFin || '',
            anoFin: f.anoFin || null
          });
          this.loading = false;
        },
        error: (err) => {
          console.error('Error cargando formación', err);
          this.loading = false;
        }
      });
    }

    // Watch cursandoAhora to conditionally require mesFin/anoFin
    this.form.get('cursandoAhora')?.valueChanges.subscribe((activo) => {
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

    const body: Formacion = this.form.value as Formacion;
    const obs = this.editing && this.currentId
      ? this.formacionesService.update(this.currentId, body)
      : this.formacionesService.create(body);

    obs.subscribe({
      next: () => {
        this.loading = false;
        if (this.loadingSwalTimer) { clearTimeout(this.loadingSwalTimer); this.loadingSwalTimer = null; }
        if (Swal.isVisible()) { Swal.close(); }

        const successTitle = this.editing ? 'Formación actualizada' : 'Formación guardada';
        const successText = this.editing
          ? 'Los cambios se han guardado correctamente.'
          : 'La formación se ha creado correctamente.';

        if (!this.editing) {
          this.form.reset({
            anoInicio: new Date().getFullYear(),
            cursandoAhora: false
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
        console.error('Error guardando formación', err);
        this.loading = false;
        if (this.loadingSwalTimer) { clearTimeout(this.loadingSwalTimer); this.loadingSwalTimer = null; }
        if (Swal.isVisible()) { Swal.close(); }

        Swal.fire({
          title: 'Error al guardar',
          text: 'No se ha podido guardar la formación. Inténtalo de nuevo.',
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

  salir(): void { this.router.navigate(['/portfolio']); }
}
