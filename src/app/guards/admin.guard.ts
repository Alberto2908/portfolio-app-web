import { Injectable } from '@angular/core';
import { CanActivate, CanLoad, Route, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable, map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate, CanLoad {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.checkAdmin(state.url);
  }
  
  canLoad(
    route: Route,
    segments: UrlSegment[]
  ): Observable<boolean> {
    const url = `/${route.path}`;
    return this.checkAdmin(url);
  }
  
  private checkAdmin(url: string): Observable<boolean> {
    return this.authService.checkAuthStatus().pipe(
      take(1),
      map(response => {
        if (response.authenticated && response.role === 'ROLE_ADMIN') {
          return true;
        }
        
        console.warn('Access denied to admin area. Redirecting to login.');
        this.router.navigate(['/login'], { 
          queryParams: { returnUrl: url }
        });
        return false;
      })
    );
  }
}
