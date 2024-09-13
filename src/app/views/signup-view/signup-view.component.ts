import { Component } from '@angular/core';
import { UsuarioComponent } from '../../models/usuario/usuario.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signup-view',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './signup-view.component.html',
  styleUrl: './signup-view.component.css'
})
export class SignupViewComponent {
  usuario: UsuarioComponent = new UsuarioComponent();
  email_field: string = "";
  password_field: string = "";
  constructor() {}

  Signup() {
    // TODO: Añadri validaciones
    this.usuario.addUserProfile(this.email_field, this.password_field);
  }
}
