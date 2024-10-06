import { Injectable } from '@angular/core';
import { createUserWithEmailAndPassword, Auth, signInWithEmailAndPassword } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedIn: boolean = true;
  msjError: string = '';
  user: any;

  constructor(private auth: Auth) { }

  IsLoggedIn() {
    return this.isLoggedIn;
  }

  async Login(email: string, password: string) {
    try{
      // Inicia sesion con email y password en fireauth
      const res = await signInWithEmailAndPassword(this.auth, email, password);
      if (res.user.email !== null && res.user.uid !== null && res.user.email === email) {
        this.user = {
          email: res.user.email,
          uid: res.user.uid
        }
        this.isLoggedIn = true;
      }
      else throw new Error("Error al iniciar sesion"); 
    } catch(e: any){      
      if(e.code === "auth/invalid-credential"){
        throw new Error("Credenciales invalidas");
      }
      else throw new Error("Error al iniciar sesion");
    } 
  }

  async Signup(email: string, password: string) {
    try {
      const res = await createUserWithEmailAndPassword(this.auth, email, password);
      if (res.user.email !== null && res.user.uid !== null) {
        this.user = {
          email: res.user.email,
          uid: res.user.uid
        }
        console.log(this.user);
        this.isLoggedIn = true;
      }
      else{
        throw new Error("Error al crear usuario");
      }
    } catch (e: any) {
      switch (e.code) {
        case "auth/invalid-email":
          this.msjError = "Email invalido";
          break;
        case "auth/email-already-in-use":
          this.msjError = "Email ya en uso";
          break;
        case "auth/invalid-credential":
          this.msjError = "Credenciales invalidas";
          break;
        default:
          this.msjError = e.code
          break;
      }
      throw new Error(this.msjError);
    }
  }

  Logout(): boolean {
    // Logica de cierre de sesion
    console.log('Usuario serro sesion');
    this.isLoggedIn = false;
    return true;
  }
}
