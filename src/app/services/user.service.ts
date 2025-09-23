import { inject, Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { IUser } from '../interfaces/i-user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private firestore = inject(AngularFirestore);

  constructor() { }

  async CreateUser(user: IUser){
    await this.firestore.collection('users').doc(user.id).set(user)
    .then(() => {
      console.log('Usuario creado con éxito en Firestore');
    })
    .catch((e) => {
      console.error("Error al crear el usuario en Firestore", e);
    });
  }
}
