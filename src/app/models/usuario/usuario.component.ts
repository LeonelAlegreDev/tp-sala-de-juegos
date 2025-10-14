import { Component, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, DocumentReference, CollectionReference } from '@angular/fire/firestore';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [],
  templateUrl: './usuario.component.html',
  styleUrl: './usuario.component.css'
})
export class UsuarioComponent {
  private firestore: Firestore = inject(Firestore); // inject Cloud Firestore
  users$: Observable<UserProfile[]>;
  usersCollection: CollectionReference;

  constructor() {
    // get a reference to the user-profile collection
    this.usersCollection = collection(this.firestore, 'usuarios');

    // get documents (data) from the collection using collectionData
    this.users$ = collectionData(this.usersCollection) as Observable<UserProfile[]>;
  }

  async addUserProfile(email: string, password: string) {
    let existMail = true;

    this.users$.subscribe(users => {
      for (const user of users) {
        if (user.email === email) {
          console.log('Ya existe un usuario con ese email');
          existMail = false;
          break;
        }
      }
    });

    if (email === "" || password === "") {
      console.log('No se puede agregar un usuario sin email y contraseña');
      return false;
    }
    if (existMail) {
      console.log('Error, ya existe un usuario con ese email');
      return false;
    }
    try {
      const result = await addDoc(this.usersCollection, <UserProfile>{ email, password });

      if (result instanceof DocumentReference && result.id) {
        console.log('Usuario creado con ID: ', result.id);
        return true;
      }
      else return false;
    }
    catch (error) {
      console.error('Error al agregar el usuario: ', error);
      return false;
    }
  }
}
export interface UserProfile {
  email: string;
  password: string;
}
