import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { IMensaje } from '../interfaces/i-mensaje';
import { Firestore, collection, addDoc, collectionData, doc, serverTimestamp, setDoc, arrayUnion, docData } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  // Nombres fijos para la colección y el documento único del chat
  private readonly CHAT_COLLECTION_NAME = 'chat-general';
  private readonly CHAT_DOCUMENT_ID = 'el-chat-unico'; // Puedes poner el ID que quieras
  private readonly MESSAGES_FIELD_NAME = 'messages'; // Nombre del campo que contendrá el array de mensajes

  constructor(private firestore: Firestore) { }

  /**
   * Envía un nuevo mensaje al chat general.
   * Lo añade al array 'messages' en el único documento de la colección 'chat-general'.
   * Si el documento o el array 'messages' no existen, los crea.
   */
  async sendMessage(message: IMensaje): Promise<void> {
    // Obtener una referencia al documento único del chat
    const chatDocRef = doc(this.firestore, this.CHAT_COLLECTION_NAME, this.CHAT_DOCUMENT_ID);

    // Creamos el objeto de mensaje que se guardará en Firestore.
    // Usamos serverTimestamp() para que Firebase registre la fecha exacta de su servidor,
    // lo cual es mejor para la consistencia entre clientes.

    try {
      // Usamos 'setDoc' con la opción 'merge: true' y 'arrayUnion'.
      // 'arrayUnion' es crucial aquí: añade el elemento al array 'messages'.
      // Si el campo 'messages' no existe en el documento, lo creará como un array con este mensaje.
      // Si el documento 'el-chat-unico' no existe, 'setDoc' lo creará.
      console.log("enviando mensaje:", message);
      await setDoc(
        chatDocRef,
        { [this.MESSAGES_FIELD_NAME]: arrayUnion(message) },
        { merge: true } // Esto evita sobrescribir todo el documento, solo fusiona el nuevo campo/valor
      );
      console.log('Mensaje enviado y añadido al chat general.');
    } catch (error) {
      console.error('Error al enviar el mensaje al chat general:', error);
      throw error; // Re-lanzamos el error para que el componente que llama pueda manejarlo
    }
  }

  /**
   * Obtiene la lista completa de mensajes del chat general en tiempo real.
   * Retorna un Observable que se actualizará cada vez que se añada un nuevo mensaje.
   */
  getMessages(): Observable<IMensaje[]> {
    // Obtener una referencia al documento único del chat
    const chatDocRef = doc(this.firestore, this.CHAT_COLLECTION_NAME, this.CHAT_DOCUMENT_ID);

    // Usamos 'docData' de '@angular/fire/firestore' para obtener el contenido del documento
    // y mantenerlo sincronizado en tiempo real.
    return docData(chatDocRef).pipe(
      map(docDataSnapshot => {
        // Extraemos el array de mensajes. Si no existe el campo o el documento, devolvemos un array vacío.
        const messages = (docDataSnapshot?.[this.MESSAGES_FIELD_NAME] || []) as IMensaje[];
        return messages;
      })
    );
  }
}
