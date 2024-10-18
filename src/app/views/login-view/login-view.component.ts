import { Component } from '@angular/core';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormGroup, FormsModule, ReactiveFormsModule, 
         Validators, FormControl } from '@angular/forms';


@Component({
  selector: 'app-login-view',
  standalone: true,
  imports: [RouterLink, RouterOutlet, FormsModule, ReactiveFormsModule],
  templateUrl: './login-view.component.html',
  styleUrl: './login-view.component.css'
})
export class LoginViewComponent {
  // TODO: Crear tipo de dato para el usuario
  form!: FormGroup;
  email_error = '';
  password_error = '';
  form_error = '';

  constructor(public auth: AuthService, private router: Router) {
    this.initForm();
  }

  private initForm() {
    this.form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    });
  }

  private ValidarFormulario(): boolean {
    if(this.form.invalid){
      this.form.markAllAsTouched();

      if(this.form.get('email')!.hasError('required')){
        this.form.get('email')!.setErrors({ error: 'El email es requerido' });
      }
      if(this.form.get('email')!.hasError('email')){
        this.form.get('email')!.setErrors({ error: 'El email no es valido' });
      }

      if(this.form.get('password')!.hasError('required')){
        this.form.get('password')!.setErrors({ error: 'La contraseña es requerida' });
      }
      if(this.form.get('password')!.hasError('minlength')){
        this.form.get('password')!.setErrors({ error: 'La contraseña debe tener 6 caractares o más' });
      }

      return false;
    }
    return true;
  }

  async Submit() {
    // Valida los campos del formulario
    if(this.ValidarFormulario()){
      this.email_error = '';
      this.password_error = '';

      try{
        await this.auth.Login(this.form.value.email, this.form.value.password);
        console.log("Usuario logeado con exito");
        this.form_error = '';
        this.router.navigate(['/juegos']);
      }
      catch (error: any) {
        if(error.message === "Credenciales invalidas"){
          this.form_error = error.message;
        }
        else this.form_error = "Error al iniciar sesion";
        console.log(error.message);
      }
    }
    else {
      if(this.form.get('email')!.errors !== null){
        this.email_error = this.form.get('email')!.errors!['error'];
      }
      else this.email_error = '';

      if(this.form.get('password')!.errors !== null){
        this.password_error = this.form.get('password')!.errors!['error'] ? this.form.get('password')!.errors!['error'] : '';
      }
      else this.password_error = '';

      console.log('Formulario invalido');
    }
  }

  Autocompletar() {
    this.form.setValue({
      email: 'usuario1@email.com',
      password: '123456'
    });
  }
}
