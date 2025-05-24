import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly sessionKey = 'isLoggedIn';

  private readonly user = {
    email: "admin@xyzcompany.com",
    password: "password123"
  }

  login(email: string, password: string): boolean {
    if (email === this.user.email && password === this.user.password) {
      sessionStorage.setItem(this.sessionKey, 'true');
      return true;
    }
    return false;
  }

  logout(): void {
    sessionStorage.removeItem(this.sessionKey);
  }

  isAuthenticated(): boolean {
    return sessionStorage.getItem(this.sessionKey) === 'true';
  }

  getUser(): { email: string, password: string } {
    return this.user;
  }
}
