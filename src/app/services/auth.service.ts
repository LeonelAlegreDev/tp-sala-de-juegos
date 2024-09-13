import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedIn: boolean = false;

  IsLoggedIn() {
    return this.isLoggedIn;
  }

  login() {
    console.log('Usuario logeado');
    this.isLoggedIn = true;
  }

  Logout(): boolean {
    // Logica de cierre de sesion
    console.log('Usuario serro sesion');
    this.isLoggedIn = false;
    return true;
  }
}
