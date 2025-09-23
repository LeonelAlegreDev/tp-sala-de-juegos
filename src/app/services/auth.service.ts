import { inject, Injectable } from '@angular/core';
import {
  Auth,
  browserSessionPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  user,
  User,
} from '@angular/fire/auth';
import { setPersistence } from 'firebase/auth';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$: Observable<User | null>;
  firebaseAuth: Auth = inject(Auth);

  constructor() {
    this.setSessionStoragePersistence();
    this.user$ = user(this.firebaseAuth);
  }

  private setSessionStoragePersistence(): void {
    setPersistence(this.firebaseAuth, browserSessionPersistence);
  }

  async Login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password
    ).then(() => {
      console.log('Usuario conectado a Firebase Auth');
      return;
    });
  }

  async Logout(): Promise<void> {
    await signOut(this.firebaseAuth).then(() => {
      sessionStorage.clear();
      console.log('Usuario desconectado de Firebase Auth');
      return;
    })
    // .catch((e) => {
    //   console.error(e);
    // });
  }

  async Signup(email: string, password: string): Promise<void> {
    await createUserWithEmailAndPassword(this.firebaseAuth, email, password)
    .then((userCredentials) => {
      console.log("Usuario registrado en Firebase Auth");
        return userCredentials.user.uid;
    })
    .catch((e) =>{
      console.error(e);
    });
  }
}
