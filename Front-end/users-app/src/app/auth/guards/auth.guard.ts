import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { AuthService, publicRoutes } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    if (!this.authService.getToken()) {
      if (route.url.length > 0 && publicRoutes.some(route => state.url.includes(route))) {
        return true;
      } else {
        this.router.navigate(['/signin']);
        return false;
      }
    } else {
      if (route.url.length > 0 && publicRoutes.some(route => state.url.includes(route))) {
        this.router.navigate(['/users']);
        return false;
      } else {
        return true;
      }
    }
  }
}
