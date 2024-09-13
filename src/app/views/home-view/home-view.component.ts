import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home-view',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  templateUrl: './home-view.component.html',
  styleUrl: './home-view.component.css'
})
export class HomeViewComponent {
  title: string = 'Bienvenido a la sala de juegos!';
  appName: string = 'Sala de Juegos';

  constructor(private authService: AuthService) {}

  IsLoggedIn() {
    return this.authService.IsLoggedIn();
  }

  Logout(): boolean {
    return this.authService.Logout() ? true : false;
  }
}
