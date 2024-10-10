import { Component } from '@angular/core';

@Component({
  selector: 'app-ahorcado',
  standalone: true,
  imports: [],
  templateUrl: './ahorcado.component.html',
  styleUrl: './ahorcado.component.css'
})
export class AhorcadoComponent {
  gameStateList = ['start', 'playing', 'win', 'lose'];
  gameState = this.gameStateList[0];

  Start(){
    console.log("Juego iniciado");
    this.gameState = this.gameStateList[1]; // playing
  }
}
