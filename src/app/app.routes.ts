import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { PortfolioComponent } from './components/portfolio/portfolio.component';
import { LoginComponent } from './components/login/login.component';
import { HabilidadesAdminComponent } from './components/habilidades-admin/habilidades-admin.component';
import { ExperienciaAdminComponent } from './components/experiencia-admin/experiencia-admin.component';
import { FormacionAdminComponent } from './components/formacion-admin/formacion-admin.component';
import { AdminGuard } from './guards/admin.guard';
import { ChangePasswordAdminComponent } from './components/change-password-admin/change-password-admin.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'portfolio', component: PortfolioComponent },
  { 
    path: 'portfolio/admin/habilidades', 
    component: HabilidadesAdminComponent,
    canActivate: [AdminGuard]
  },
  { 
    path: 'portfolio/admin/habilidades/:id', 
    component: HabilidadesAdminComponent,
    canActivate: [AdminGuard]
  },
  { 
    path: 'portfolio/admin/experiencias', 
    component: ExperienciaAdminComponent,
    canActivate: [AdminGuard]
  },
  { 
    path: 'portfolio/admin/experiencias/:id', 
    component: ExperienciaAdminComponent,
    canActivate: [AdminGuard]
  },
  { 
    path: 'portfolio/admin/formaciones', 
    component: FormacionAdminComponent,
    canActivate: [AdminGuard]
  },
  { 
    path: 'portfolio/admin/formaciones/:id', 
    component: FormacionAdminComponent,
    canActivate: [AdminGuard]
  },
  {
    path: 'portfolio/admin/password',
    component: ChangePasswordAdminComponent,
    canActivate: [AdminGuard]
  }
];
