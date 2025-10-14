import { Component } from '@angular/core';
import { MenuComponent } from '../../components/menu/menu.component';
import { ChatService } from '../../services/chat.service';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { IMensaje } from '../../interfaces/i-mensaje';
import { OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { CommonModule } from '@angular/common';
import { firstValueFrom, Observable } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [MenuComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {
  private chatService = inject(ChatService);
  private authService = inject(AuthService);

  messages$: Observable<IMensaje[]>;
  nuevoMensaje = new FormControl('');
  usuarioActual$ = this.authService.user$;

  constructor() {
    this.messages$ = this.chatService.getMessages();
  }

  async enviarMensaje(): Promise<void> {
    const usuario = await firstValueFrom(this.usuarioActual$);
    if (usuario && this.nuevoMensaje.value && usuario.email) {
      const mensaje: IMensaje = {
        idEmisor: usuario.uid,
        email: usuario.email,
        mensaje: this.nuevoMensaje.value,
        fecha: new Date(),
      };
      await this.chatService.sendMessage(mensaje);
      this.nuevoMensaje.reset();
    }
  }
}
