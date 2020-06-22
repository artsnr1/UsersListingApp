import { Observable } from "rxjs";
import { Injectable } from '@angular/core';
import { environment } from "src/environments/environment";
import { HttpClient } from "@angular/common/http";
import { map, catchError } from 'rxjs/operators';
import { Router } from "@angular/router";

export const publicRoutes =  ['/signin', '/signup', '/verify'];

@Injectable()
export class AuthService {
    token: string;
    constructor(private httpClient: HttpClient, private router: Router) {}

    signUpUser(body: any): Observable<any> {
        const signUpUrl = `${environment.api_base_url}/signup`;
        return this.httpClient.post(signUpUrl, body);    
    }
    signInUser(body: any): Observable<any> {
        const signInUrl = `${environment.api_base_url}/signin`;
        return this.httpClient.post(signInUrl, body).pipe(
            map((response: any) => {
              this.setToken(response.token);
            })
        )
    }
    
    logout() {
        localStorage.clear();
        this.token = null;
        return this.router.navigate(['/signin'])
        
    }
    
    setToken(token: string) {
        this.token = token
        localStorage.setItem('access_token', JSON.stringify(this.token));
    }
    
    getToken(): string {
        if (!this.token) {
            this.token = JSON.parse(localStorage.getItem('access_token'));
        }
        return this.token;
    }
}