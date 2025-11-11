import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, ActivatedRoute, RouterModule } from '@angular/router';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { TranslateModule } from '@ngx-translate/core';
import { filter, distinctUntilChanged } from 'rxjs/operators';
import { I18nService } from '../../services/i18n.service';

interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule, NzBreadCrumbModule, NzIconModule, TranslateModule],
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.css']
})
export class BreadcrumbComponent implements OnInit {
  breadcrumbs: Breadcrumb[] = [];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private i18nService: I18nService
  ) {}

  ngOnInit(): void {
    // Rebuild breadcrumbs on route changes
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        distinctUntilChanged()
      )
      .subscribe(() => {
        setTimeout(() => {
          this.breadcrumbs = this.buildBreadcrumbs(this.activatedRoute.root);
        }, 100);
      });

    // Rebuild breadcrumbs on language changes
    this.i18nService.currentLang$.subscribe(() => {
      setTimeout(() => {
        this.breadcrumbs = this.buildBreadcrumbs(this.activatedRoute.root);
      }, 100);
    });

    // Initial breadcrumb with delay to ensure translations are loaded
    setTimeout(() => {
      this.breadcrumbs = this.buildBreadcrumbs(this.activatedRoute.root);
    }, 200);
  }

  private buildBreadcrumbs(
    route: ActivatedRoute,
    url: string = '',
    breadcrumbs: Breadcrumb[] = []
  ): Breadcrumb[] {
    const children: ActivatedRoute[] = route.children;
    if (children.length === 0) {
      return breadcrumbs;
    }

    for (const child of children) {
      const segments = child.snapshot.url;
      if (segments && segments.length > 0) {
        for (let i = 0; i < segments.length; i++) {
          const part = segments[i].path;
          if (!part) { continue; }

          // Special case: group 'admin' + 'habilidades' as one breadcrumb
          if (part === 'admin' && i + 1 < segments.length && segments[i + 1].path === 'habilidades') {
            url += `/admin/habilidades`;
            breadcrumbs.push({ label: this.i18nService.instant('breadcrumb.habilidades_admin'), url });
            i++; // skip next segment as it's grouped
            continue;
          }

          // Special case: group 'admin' + 'experiencias' as one breadcrumb
          if (part === 'admin' && i + 1 < segments.length && segments[i + 1].path === 'experiencias') {
            url += `/admin/experiencias`;
            breadcrumbs.push({ label: this.i18nService.instant('breadcrumb.experiencias_admin'), url });
            i++; // skip next segment as it's grouped
            continue;
          }

          // Special case: group 'admin' + 'formaciones' as one breadcrumb
          if (part === 'admin' && i + 1 < segments.length && segments[i + 1].path === 'formaciones') {
            url += `/admin/formaciones`;
            breadcrumbs.push({ label: this.i18nService.instant('breadcrumb.formaciones_admin'), url });
            i++; // skip next segment as it's grouped
            continue;
          }

          // Special case: group 'admin' + 'password' as one breadcrumb
          if (part === 'admin' && i + 1 < segments.length && segments[i + 1].path === 'password') {
            url += `/admin/password`;
            breadcrumbs.push({ label: this.i18nService.instant('breadcrumb.cambiar_contrasena'), url });
            i++; // skip next segment as it's grouped
            continue;
          }

          // Skip ID-like segments (e.g., Mongo ObjectId or numeric IDs) from breadcrumbs
          const isIdLike = /^[0-9a-fA-F]{24}$/.test(part) || /^\d+$/.test(part);
          url += `/${part}`;
          if (isIdLike) {
            continue;
          }

          const label = this.getRouteLabel(part);
          if (label && part !== 'home') {
            breadcrumbs.push({ label, url });
          }
        }
      }
      return this.buildBreadcrumbs(child, url, breadcrumbs);
    }
    return breadcrumbs;
  }

  private getRouteLabel(route: string): string {
    const translationKeys: { [key: string]: string } = {
      'home': 'breadcrumb.home',
      'portfolio': 'breadcrumb.portfolio'
    };

    const key = translationKeys[route];
    if (key) {
      return this.i18nService.instant(key);
    }
    return route.charAt(0).toUpperCase() + route.slice(1);
  }
}
