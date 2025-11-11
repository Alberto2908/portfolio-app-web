import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router, RouterModule } from '@angular/router';
import { FormacionesService } from '../../services/formaciones.service';
import { Formacion } from '../../models/formacion.model';
import { AuthService } from '../../services/auth.service';
import { I18nService } from '../../services/i18n.service';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-formacion',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './formacion.component.html',
  styleUrls: ['./formacion.component.css']
})
export class FormacionComponent implements OnInit {
  formaciones: Formacion[] = [];
  loading = false;
  isAdmin$: Observable<boolean>;

  constructor(
    private formacionesService: FormacionesService,
    private router: Router,
    private authService: AuthService,
    private i18nService: I18nService
  ) {
    this.isAdmin$ = this.authService.isAdmin$;
  }

  ngOnInit(): void {
    this.loadFormaciones();
  }

  private monthIndex(mes: string): number {
    if (!mes) return -1;
    switch (mes.toLowerCase()) {
      case 'enero': return 1;
      case 'febrero': return 2;
      case 'marzo': return 3;
      case 'abril': return 4;
      case 'mayo': return 5;
      case 'junio': return 6;
      case 'julio': return 7;
      case 'agosto': return 8;
      case 'septiembre': return 9;
      case 'octubre': return 10;
      case 'noviembre': return 11;
      case 'diciembre': return 12;
      default: return -1;
    }
  }

  loadFormaciones(): void {
    this.loading = true;
    this.formacionesService.list(0, 100).subscribe({
      next: (response) => {
        this.formaciones = [...response.content].sort((a, b) => {
          const aAct = !!a.cursandoAhora; const bAct = !!b.cursandoAhora;
          if (aAct !== bAct) return aAct ? -1 : 1;

          if (aAct && bAct) {
            if (b.anoInicio !== a.anoInicio) return b.anoInicio - a.anoInicio;
            return this.monthIndex(b.mesInicio) - this.monthIndex(a.mesInicio);
          }

          if ((b.anoFin ?? 0) !== (a.anoFin ?? 0)) return (b.anoFin ?? 0) - (a.anoFin ?? 0);
          const bEndM = this.monthIndex(b.mesFin || '');
          const aEndM = this.monthIndex(a.mesFin || '');
          if (bEndM !== aEndM) return bEndM - aEndM;

          if (b.anoInicio !== a.anoInicio) return b.anoInicio - a.anoInicio;
          return this.monthIndex(b.mesInicio) - this.monthIndex(a.mesInicio);
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando formaciones', err);
        this.loading = false;
      }
    });
  }

  formatPeriod(f: Formacion): string {
    const mesInicioTrad = this.translateMonth(f.mesInicio);
    const inicio = `${mesInicioTrad} ${f.anoInicio}`;
    if (f.cursandoAhora) {
      const current = this.i18nService.instant('experiencia.current');
      return `${inicio} - ${current}`;
    }
    const mesFinTrad = this.translateMonth(f.mesFin || '');
    return `${inicio} - ${mesFinTrad} ${f.anoFin}`;
  }

  private translateMonth(month: string): string {
    if (!month) return '';
    const key = `months.${month.toLowerCase()}`;
    return this.i18nService.instant(key);
  }

  onEdit(f: Formacion): void {
    this.router.navigate(['/portfolio/admin/formaciones', f.id]);
  }

  onDelete(f: Formacion): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminará la formación ${f.nombre}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'swal-portfolio-popup',
        title: 'swal-portfolio-title',
        confirmButton: 'swal-portfolio-confirm',
        cancelButton: 'swal-portfolio-cancel',
        actions: 'swal-portfolio-actions'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.formacionesService.delete(f.id!).subscribe({
          next: () => {
            Swal.fire({
              title: 'Eliminado',
              text: 'Formación eliminada correctamente',
              icon: 'success',
              timer: 1200,
              showConfirmButton: false,
              customClass: {
                popup: 'swal-portfolio-popup',
                title: 'swal-portfolio-title',
                confirmButton: 'swal-portfolio-confirm'
              }
            });
            this.loadFormaciones();
          },
          error: () => {
            Swal.fire({
              title: 'Error',
              text: 'No se pudo eliminar la formación',
              icon: 'error',
              customClass: {
                popup: 'swal-portfolio-popup',
                title: 'swal-portfolio-title',
                confirmButton: 'swal-portfolio-confirm'
              }
            });
          }
        });
      }
    });
  }

  trackByFormacionId(index: number, f: Formacion): string {
    return f.id || index.toString();
  }

  getNombre(f: Formacion): string {
    const lang = this.i18nService.getCurrentLang();
    return lang === 'en' && f.nombreEn ? f.nombreEn : f.nombre;
  }
}
