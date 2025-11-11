import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Habilidad } from '../../models/habilidad.model';
import { RouterModule } from '@angular/router';
import { HabilidadesService } from '../../services/habilidades.service';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { I18nService } from '../../services/i18n.service';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-habilidades',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './habilidades.component.html',
  styleUrls: ['./habilidades.component.css']
})
export class HabilidadesComponent implements OnInit {
  habilidades: Habilidad[] = [];
  loading = false;
  isAdmin$: Observable<boolean>;
  private readonly backendBaseUrl = 'http://localhost:8085';
  private readonly categoryOrder: Array<Habilidad['category']> = ['frontend', 'backend', 'database', 'tools', 'other'];
  grouped: { category: Habilidad['category']; items: Habilidad[] }[] = [];

  constructor(
    private habilidadesService: HabilidadesService, 
    private router: Router,
    private authService: AuthService,
    private i18nService: I18nService
  ) {
    this.isAdmin$ = this.authService.isAdmin$;
  }

  ngOnInit(): void {
    this.loading = true;
    this.habilidadesService.list(0, 200).subscribe({
      next: page => {
        this.habilidades = page.content || [];
        this.loading = false;
        this.buildGroups();
      },
      error: err => {
        console.error('Error cargando habilidades', err);
        this.loading = false;
      }
    });
  }

  private refresh(): void {
    this.loading = true;
    this.habilidadesService.list(0, 200).subscribe({
      next: page => { this.habilidades = page.content || []; this.loading = false; this.buildGroups(); },
      error: () => { this.loading = false; }
    });
  }

  trackByHabilidadId(index: number, habilidad: Habilidad): string {
    return habilidad.id;
  }

  getCategoryName(category: string): string {
    const categoryKeys: { [key: string]: string } = {
      'frontend': 'habilidades.categories.frontend',
      'backend': 'habilidades.categories.backend',
      'database': 'habilidades.categories.database',
      'tools': 'habilidades.categories.tools',
      'other': 'habilidades.categories.other'
    };
    const key = categoryKeys[category];
    return key ? this.i18nService.instant(key) : category;
  }

  imageSrc(h: Habilidad): string {
    if (!h?.image) return 'assets/skills/default.png';
    if (h.image.startsWith('http')) return h.image;
    if (h.image.startsWith('/uploads')) return `${this.backendBaseUrl}${h.image}`;
    return h.image;
  }

  onEdit(h: Habilidad): void {
    if (!h?.id) return;
    this.router.navigate(['/portfolio/admin/habilidades', h.id]);
  }

  onDelete(h: Habilidad): void {
    if (!h?.id) return;
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Se eliminará "${h.name}" y no se podrá deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'swal-portfolio-popup',
        title: 'swal-portfolio-title',
        confirmButton: 'swal-portfolio-confirm',
        actions: 'swal-portfolio-actions'
      }
    }).then(res => {
      if (res.isConfirmed) {
        this.habilidadesService.delete(h.id!).subscribe({
          next: () => {
            Swal.fire({
              title: 'Eliminado',
              text: 'La habilidad se ha borrado correctamente.',
              icon: 'success',
              customClass: { popup: 'swal-portfolio-popup', title: 'swal-portfolio-title', confirmButton: 'swal-portfolio-confirm', actions: 'swal-portfolio-actions' }
            });
            this.refresh();
          },
          error: () => {
            Swal.fire({
              title: 'Error',
              text: 'No se pudo borrar la habilidad.',
              icon: 'error',
              customClass: { popup: 'swal-portfolio-popup', title: 'swal-portfolio-title', confirmButton: 'swal-portfolio-confirm', actions: 'swal-portfolio-actions' }
            });
          }
        });
      }
    });
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'assets/skills/default.png';
    }
  }

  private buildGroups(): void {
    const map = new Map<Habilidad['category'], Habilidad[]>();
    for (const c of this.categoryOrder) {
      map.set(c, []);
    }
    for (const h of this.habilidades) {
      const arr = map.get(h.category) || [];
      arr.push(h);
      map.set(h.category, arr);
    }
    this.grouped = this.categoryOrder
      .map(c => ({ category: c, items: map.get(c) || [] }))
      .filter(g => g.items.length > 0);
  }
}
