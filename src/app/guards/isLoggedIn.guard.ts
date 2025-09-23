import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
// import { FireAuthService } from '../servicios/fire-auth.service';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

export const isLoggedIn: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.user$.pipe(
    map((user) => {
      if (user) {
        console.log('Usuario autenticado . Acceso concedido');
        return true;
      } else {
        console.log('Usuario no autenticado . Acceso denegado');
        router.navigate(['/welcome']);
        return false;
      }
    })
  );
};