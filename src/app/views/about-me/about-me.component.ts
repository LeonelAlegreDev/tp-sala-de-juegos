import { Component } from '@angular/core';
import { MenuComponent } from '../../components/menu/menu.component';

@Component({
  selector: 'app-about-me',
  standalone: true,
  imports: [MenuComponent],
  templateUrl: './about-me.component.html',
  styleUrl: './about-me.component.css'
})
export class AboutMeComponent {

}
