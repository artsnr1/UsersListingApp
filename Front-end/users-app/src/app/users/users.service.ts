import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from './models/user.model';
import { map } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class UsersService {
headers: HttpHeaders = new HttpHeaders().set('Authorization', `Bearer ${this.authService.getToken()}`)

  constructor(private httpClient: HttpClient, private authService: AuthService) {}

  getUsers(page, searchTerm?): Observable<any> {
    page = page || 1;
    const getUsersURL = `${environment.api_base_url}/users/${page}`;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authService.getToken()}`)
    let params = null;
    if(searchTerm)
        params = new HttpParams().set('search', searchTerm);

    return this.httpClient.get(getUsersURL, {headers: headers, params: params }).pipe(
        map(resp => {
            return {
                users: resp['users'].map(user => new User(user)),
                pagination: resp['pagination']
            }
        })
    );
  }

  getUserDataFile(userId, format){
    const getUserFileURL = `${environment.api_base_url}/${format}/${userId}`;
    const mimeType = format==='pdf'? 'application/json': 'text/csv'
    // const headers = new HttpHeaders({
    //     'Authorization': `Bearer ${this.authService.getToken()}`,
    //     // 'Content-Type': mimeType
    //   });    
    const httpOptions = {
        responseType: 'blob' as 'json',
        headers: new HttpHeaders({
          'Authorization': `Bearer ${this.authService.getToken()}`,
          observe: 'response',
        })
      };
    return this.httpClient.get(getUserFileURL, httpOptions)
  }
}

