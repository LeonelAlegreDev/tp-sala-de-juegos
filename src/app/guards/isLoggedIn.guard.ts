import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
// import { FireAuthService } from '../servicios/fire-auth.service';
import { AuthService } from '../services/auth.service';

export const isLoggedIn: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if(!authService.IsLoggedIn()) { 
    console.log("Acceso denegado, usuario no logueado");
    console.log("Redirigiendo a /bienvenida");
    router.navigate(["/welcome"]);
    return false;
  }
  console.log("Acceso permitido, usuario logueado");
  return true;
};