import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home-view',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home-view.component.html',
  styleUrl: './home-view.component.css'
})
export class HomeViewComponent {
  title: string = 'Comenzá a jugar ahora!';
  appName: string = 'Sala de Juegos';

  constructor(private authService: AuthService) {}

}
