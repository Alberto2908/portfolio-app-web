import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ContactaConmigoComponent } from '../contacta-conmigo/contacta-conmigo.component';
import { HabilidadesComponent } from '../habilidades/habilidades.component';
import { ExperienciaComponent } from '../experiencia/experiencia.component';
import { FormacionComponent } from '../formacion/formacion.component';
import { AuthService } from '../../services/auth.service';
import { Observable, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { FooterComponent } from '../footer/footer.component';
import { VisitCounterService } from '../../services/visit-counter.service';
import { VisitCounter } from '../../models/visit-counter.model';

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, ContactaConmigoComponent, HabilidadesComponent, ExperienciaComponent, FormacionComponent, FooterComponent],
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {
  isAdmin$: Observable<boolean>;
  visitCounter: VisitCounter | null = null;

  constructor(
    private authService: AuthService,
    private visitCounterService: VisitCounterService
  ) {
    this.isAdmin$ = this.authService.isAdmin$;
  }

  ngOnInit(): void {
    // Register visit on portfolio load and, if admin, read updated count afterwards
    this.isAdmin$.subscribe(isAdmin => {
      if (isAdmin) {
        this.visitCounterService
          .incrementVisit()
          .pipe(
            switchMap(() => this.visitCounterService.getVisitCount()),
            catchError(err => {
              console.error('Error updating visit counter', err);
              return of(null);
            })
          )
          .subscribe(counter => {
            if (counter) this.visitCounter = counter;
          });
      } else {
        // Not admin: just increment without fetching
        this.visitCounterService.incrementVisit().subscribe({
          error: (err) => console.error('Error incrementing visit', err)
        });
      }
    });
  }

  loadVisitCounter(): void {
    this.visitCounterService.getVisitCount().subscribe({
      next: (counter) => {
        this.visitCounter = counter;
      },
      error: (err) => {
        console.error('Error loading visit counter', err);
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe();
  }
}
