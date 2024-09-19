import { Component } from '@angular/core';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormGroup, FormsModule, ReactiveFormsModule, 
         Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-signup-view',
  standalone: true,
  imports: [RouterLink, RouterOutlet, FormsModule, ReactiveFormsModule],
  templateUrl: './signup-view.component.html',
  styleUrl: './signup-view.component.css'
})
export class SignupViewComponent {
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

      console.log('Formulario invalido');
      return false;
    }
    console.log('Formulario valido');
    return true;
  }

  async Submit() {
    if(this.ValidarFormulario()){
      this.email_error = '';
      this.password_error = '';

      try{
        await this.auth.Signup(this.form.value.email, this.form.value.password);
        this.form_error = '';
        console.log("Usuario creado con exito");
        this.router.navigate(['/home']);
      }
      catch (error: any) {
        if(error.message === "Credenciales invalidas" || 
          error.message === "Email ya en uso" ||
          error.message === "Email invalido")
        {
          this.form_error = error.message;
        }
        else this.form_error = "Error al iniciar sesion";
        console.log(error.message);
      }
    }
    else {
      console.log(this.form.get('email')!.errors);

      if(this.form.get('email')!.errors !== null){

        this.email_error = this.form.get('email')!.errors!['error'];
        
        console.log(': ' + this.email_error);
      }
      else this.email_error = '';

      if(this.form.get('password')!.errors !== null){
        this.password_error = this.form.get('password')!.errors!['error'] ? this.form.get('password')!.errors!['error'] : '';
      }
      else this.password_error = '';
    }
  }
}
