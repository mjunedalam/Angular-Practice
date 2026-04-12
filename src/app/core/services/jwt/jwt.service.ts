import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt'

@Injectable({
  providedIn: 'root'
})
export class JwtService {
  
  private helper = new JwtHelperService()
  
  decode(token: string) {
    return this.helper.decodeToken(token);
  }

  isExpired(token: string) {
    return this.helper.isTokenExpired(token);
  }

}