import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MenuComponent } from '../../components/menu/menu.component';

@Component({
  selector: 'app-home-view',
  standalone: true,
  imports: [RouterLink, MenuComponent],
  templateUrl: './home-view.component.html',
  styleUrl: './home-view.component.css'
})
export class HomeViewComponent {
  title: string = 'Comenzá a jugar ahora!';
  appName: string = 'Sala de Juegos';

  constructor(private authService: AuthService) {}

  IsLoggedIn() {
    return this.authService.IsLoggedIn();
  }

  Logout(): boolean {
    return this.authService.Logout() ? true : false;
  }
}
