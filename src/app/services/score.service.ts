import { Injectable } from '@angular/core';
import { Firestore, collection, doc, setDoc, getDoc, updateDoc, arrayUnion } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

export interface IPuntaje {
  idUsuario: string;
  email: string;
  puntaje: number;
}

@Injectable({
  providedIn: 'root'
})
export class ScoreService {
  private readonly COLECCION_PUNTAJES = 'puntajes';
  private readonly DOCUMENTO_PREGUNTADOS = 'preguntados';
  private readonly CAMPO_LISTA_PUNTAJES = 'listaPuntajes';

  constructor(private firestore: Firestore) { }

  /**
   * Guarda un nuevo puntaje para un usuario en el documento 'preguntados'.
   * Añade el puntaje a un array llamado 'listaPuntajes'.
   * Si el documento o el array no existen, los creará.
   * @param idUsuario El ID del usuario.
   * @param puntaje El puntaje obtenido por el usuario.
   * @returns Una promesa que se resuelve cuando el puntaje ha sido guardado.
   */
  guardarPuntaje(puntaje: IPuntaje): Promise<void> {
    const puntajesDocRef = doc(this.firestore, this.COLECCION_PUNTAJES, this.DOCUMENTO_PREGUNTADOS);

    // Usamos setDoc con merge:true y arrayUnion.
    // Esto asegura que si el documento no existe, se cree.
    // Y si el array 'listaPuntajes' no existe, se cree y se añada el elemento.
    // Si ya existe, añade el elemento al final del array.
    return setDoc(puntajesDocRef, {
      [this.CAMPO_LISTA_PUNTAJES]: arrayUnion(puntaje)
    }, { merge: true })
      .then(() => console.log('Puntaje guardado exitosamente!'))
      .catch(error => {
        console.error('Error al guardar el puntaje:', error);
        throw error; // Re-lanza el error para que el componente pueda manejarlo.
      });
  }

  /**
   * Obtiene todos los puntajes del documento 'preguntados'.
   * @returns Un Observable que emite un array de objetos Puntaje.
   */
  obtenerPuntajes(): Observable<IPuntaje[]> {
    const puntajesDocRef = doc(this.firestore, this.COLECCION_PUNTAJES, this.DOCUMENTO_PREGUNTADOS);

    // from(getDoc(...)) convierte la promesa de getDoc en un Observable
    return from(getDoc(puntajesDocRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          return (data?.[this.CAMPO_LISTA_PUNTAJES] as IPuntaje[]) || [];
        } else {
          console.log('No existe el documento de puntajes de "preguntados".');
          return [];
        }
      })
    );
  }

  /**
   * Obtiene el mejor puntaje de un usuario por su ID.
   * @param idUsuario El ID del usuario.
   * @returns Un Observable que emite el mejor puntaje del usuario o null si no tiene puntajes.
   */
  obtenerMejorPuntajePorUsuario(idUsuario: string): Observable<IPuntaje | null> {
    return this.obtenerPuntajes().pipe(
      map(puntajes => {
        const puntajesUsuario = puntajes.filter(p => p.idUsuario === idUsuario);
        if (puntajesUsuario.length === 0) {
          return null;
        }
        return puntajesUsuario.reduce((mejor, actual) => actual.puntaje > mejor.puntaje ? actual : mejor);
      })
    );
  }
}
