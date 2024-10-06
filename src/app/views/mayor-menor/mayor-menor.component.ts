import { Component, ViewChildren, ElementRef, QueryList, Renderer2 } from '@angular/core';
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
  @ViewChildren('card') cardElements!: QueryList<ElementRef>;
  
  // Añadir Viewchild para acceder al elemento #mazo
  isGameStarted: boolean = false;
  mazo: any[] = [];

  constructor(private renderer: Renderer2) {}
  
  ngOnInit(): void {
    this.GenerarMazo();
  }
  ngAfterViewInit() {
    this.cardElements.changes.subscribe((changedObj) => {
      console.log(changedObj);
    });

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

        this.mazo.push({ 
          valor: valores[j], 
          palo: palos[i], 
          frontImg: url,
        });
      }
    }

    console.log("Mazo generado: ", this.mazo);
  }

  Start(): void {
    console.log("Juego iniciado");

    this.isGameStarted = true;
  }


  AcomodarMazo(i: number): string {
    const grupo = Math.floor(i / 3); 
    let transform = i * -100 + grupo * 2;
    
    return transform + '%';
  }

  DrawCard(){
    console.log("Robando carta");

    // Imprimir por consola la ultima carta del mazo
    console.log(this.mazo[0]);

    // Cambiar el color del borde de la carta a azul
    console.log(this.cardElements.last.nativeElement);

    this.MostrarCarta();
  }

  MostrarCarta(){
    const frontFace = this.cardElements.last.nativeElement.querySelector('.card__face--front');
    const backFace = this.cardElements.last.nativeElement.querySelector('.card__face--back');

    frontFace.classList.remove('hideFront');
    frontFace.classList.add('showFront');

    backFace.classList.add('hideBack');
    backFace.classList.remove('showBack');
  }

  OcultarCarta(){
    const frontFace = this.cardElements.last.nativeElement.querySelector('.card__face--front');
    const backFace = this.cardElements.last.nativeElement.querySelector('.card__face--back');
    
    frontFace.classList.remove('showFront');
    frontFace.classList.add('hideFront');
    
    backFace.classList.remove('hideBack');    
    backFace.classList.add('showBack');  
  }
}
