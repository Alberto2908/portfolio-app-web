import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router, RouterModule } from '@angular/router';
import { ExperienciasService } from '../../services/experiencias.service';
import { Experiencia } from '../../models/experiencia.model';
import { AuthService } from '../../services/auth.service';
import { I18nService } from '../../services/i18n.service';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-experiencia',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './experiencia.component.html',
  styleUrls: ['./experiencia.component.css']
})
export class ExperienciaComponent implements OnInit {
  experiencias: Experiencia[] = [];
  loading = false;
  isAdmin$: Observable<boolean>;

  constructor(
    private experienciasService: ExperienciasService,
    private router: Router,
    private authService: AuthService,
    private i18nService: I18nService
  ) {
    this.isAdmin$ = this.authService.isAdmin$;
  }

  ngOnInit(): void {
    this.loadExperiencias();
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

  loadExperiencias(): void {
    this.loading = true;
    this.experienciasService.list(0, 100).subscribe({
      next: (response) => {
        this.experiencias = [...response.content].sort((a, b) => {
          // Active first
          const aAct = !!a.trabajoActivo; const bAct = !!b.trabajoActivo;
          if (aAct !== bAct) return aAct ? -1 : 1;

          // If both active, sort by start date (year desc, month desc)
          if (aAct && bAct) {
            if (b.anoInicio !== a.anoInicio) return b.anoInicio - a.anoInicio;
            return this.monthIndex(b.mesInicio) - this.monthIndex(a.mesInicio);
          }

          // Both not active: sort by end date (year desc, month desc)
          if ((b.anoFin ?? 0) !== (a.anoFin ?? 0)) return (b.anoFin ?? 0) - (a.anoFin ?? 0);
          const bEndM = this.monthIndex(b.mesFin || '');
          const aEndM = this.monthIndex(a.mesFin || '');
          if (bEndM !== aEndM) return bEndM - aEndM;

          // Tie-breaker: start date desc
          if (b.anoInicio !== a.anoInicio) return b.anoInicio - a.anoInicio;
          return this.monthIndex(b.mesInicio) - this.monthIndex(a.mesInicio);
        });
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando experiencias', err);
        this.loading = false;
      }
    });
  }

  formatPeriod(exp: Experiencia): string {
    const mesInicioTrad = this.translateMonth(exp.mesInicio);
    const inicio = `${mesInicioTrad} ${exp.anoInicio}`;
    if (exp.trabajoActivo) {
      const current = this.i18nService.instant('experiencia.current');
      return `${inicio} - ${current}`;
    }
    const mesFinTrad = this.translateMonth(exp.mesFin || '');
    return `${inicio} - ${mesFinTrad} ${exp.anoFin}`;
  }

  private translateMonth(month: string): string {
    if (!month) return '';
    const key = `months.${month.toLowerCase()}`;
    return this.i18nService.instant(key);
  }

  onEdit(exp: Experiencia): void {
    this.router.navigate(['/portfolio/admin/experiencias', exp.id]);
  }

  onDelete(exp: Experiencia): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminará la experiencia en ${exp.empresa}`,
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
        this.experienciasService.delete(exp.id!).subscribe({
          next: () => {
            Swal.fire({
              title: 'Eliminada',
              text: 'La experiencia ha sido eliminada correctamente',
              icon: 'success',
              customClass: {
                popup: 'swal-portfolio-popup',
                title: 'swal-portfolio-title',
                confirmButton: 'swal-portfolio-confirm',
                actions: 'swal-portfolio-actions'
              }
            });
            this.loadExperiencias();
          },
          error: (err) => {
            console.error('Error eliminando experiencia', err);
            Swal.fire({
              title: 'Error',
              text: 'No se pudo eliminar la experiencia',
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
    });
  }

  goToAdmin(): void {
    this.router.navigate(['/portfolio/admin/experiencias']);
  }

  trackByExperienciaId(index: number, exp: Experiencia): string {
    return exp.id || index.toString();
  }

  getPuesto(exp: Experiencia): string {
    const lang = this.i18nService.getCurrentLang();
    return lang === 'en' && exp.puestoEn ? exp.puestoEn : exp.puesto || '';
  }

  getDescripcion(exp: Experiencia): string {
    const lang = this.i18nService.getCurrentLang();
    return lang === 'en' && exp.descripcionEn ? exp.descripcionEn : exp.descripcion;
  }
}
