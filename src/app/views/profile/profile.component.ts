import { Component, inject } from '@angular/core';
import { MenuComponent } from '../../components/menu/menu.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [MenuComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  userEmail = "ejemplo@email.com";

  constructor() {
  }

  async nGOnInit(): Promise<void> {
    console.log('ProfileComponent initialized');
  }

  async Logout() {
    await this.authService.Logout()
      .then(() => {
        console.log('Usuario desconectado');
        this.router.navigate(['/welcome']);
      })
      .catch((e) => {
        console.error("Error al desconectar el usuario", e);
      });
  }
}
