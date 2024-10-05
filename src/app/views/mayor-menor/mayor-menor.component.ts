import { Component, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { MenuComponent } from '../../components/menu/menu.component';
import { NgFor, NgStyle } from '@angular/common';

@Component({
  selector: 'app-mayor-menor',
  standalone: true,
  imports: [MenuComponent, NgFor, NgStyle],
  templateUrl: './mayor-menor.component.html',
  styleUrl: './mayor-menor.component.css'
})
export class MayorMenorComponent {
  // @ViewChildren('cardFront') cardFrontElements: QueryList<ElementRef>;
  // @ViewChildren('cardBack') cardBackElements: QueryList<ElementRef>;
  
  // Añadir Viewchild para acceder al elemento #mazo
  isGameStarted: boolean = false;
  mazo: any[] = [];

  constructor() { 
  }
  ngOnInit(): void {
    // Esperamos a que los elementos se hayan renderizado completamente
    // Una vez que las referencias estén actualizadas, puedes hacer lo que quieras
    

  }

  private GenerarMazo(): void {
    // Genera un array de 52 cartas con objetos que contienen el valor y el palo de la carta
    let palos = ['corazones', 'diamantes', 'treboles', 'picas'];
    let valores = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const relative_path = '../../../assets/images/mayor-menor/cards/';

    // Recorre los palos y los valores para generar el mazo
    for (let i = 0; i < palos.length; i++) {
      let file_start = '';

      switch (palos[i]) {
        case 'corazones':
          file_start = 'Hearts_';
          break;
        case 'diamantes':
          file_start = 'Diamond_';
          break;
        case 'treboles':
          file_start = 'Clovers_';
          break;
        case 'picas':
          file_start = 'Pikes_';
      }

      for (let j = 0; j < valores.length; j++) {
        let file_card = '';

        switch (valores[j]) {
          case 'A':
            file_card = 'A_';
            break;
          case 'J':
            file_card = 'Jack_';
            break;
          case 'Q':
            file_card = 'Queen_';
            break;
          case 'K':
            file_card = 'King_';
            break;
          default:
            file_card = valores[j] + "_";
        }
        const url = relative_path + file_start + file_card + 'white' + '.png';
        const url_back = relative_path + 'back-card-1.png';

        this.mazo.push({ 
          valor: valores[j], 
          palo: palos[i], 
          frontImg: url,
          backImg: url_back
        });
      }
    }

    console.log("Mazo generado: ", this.mazo);
  }

  Start(): void {
    // Inicia el juego
    this.isGameStarted = true;

    console.log("Juego iniciado");


    this.GenerarMazo();

  }

  CalculateTranslation(index: number): number {
    // Cada par de cartas (2 cartas) se desplaza 1px adicional
    return Math.floor(index / 2); // Esto genera el desplazamiento deseado
  }

  RotateCard(face_out: any, face_in: any){
    
  }
}
