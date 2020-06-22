import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, Params } from '@angular/router';
import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class EmailVerificationGuard implements CanActivate {
  constructor(private router: Router, private httpClient: HttpClient) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        const token = route.params['token'];  
        const confirmEmailUrl= `${environment.api_base_url}/verify/${token}`;
        return this.httpClient.get(confirmEmailUrl).pipe(
            map(resp => true),
            catchError(error => {
                if ( error instanceof HttpErrorResponse) {
                    this.router.navigate(['/signup'])
                }
                return of(false);
            })
        )
    }
}
