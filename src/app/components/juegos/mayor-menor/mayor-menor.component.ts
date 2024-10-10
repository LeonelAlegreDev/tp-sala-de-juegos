import { Component, ViewChildren, ElementRef, QueryList, Renderer2, ViewChild, HostListener } from '@angular/core';
import { NgFor, NgStyle } from '@angular/common';
import { MenuComponent } from '../../menu/menu.component';

@Component({
  selector: 'app-mayor-menor',
  standalone: true,
  imports: [MenuComponent, NgFor, NgStyle],
  templateUrl: './mayor-menor.component.html',
  styleUrl: './mayor-menor.component.css'
})
export class MayorMenorComponent {
  @ViewChildren('card') cardElements!: QueryList<ElementRef>;

  // Añadir Viewchild para acceder al elemento #mazos
  isGameStarted: boolean = false;
  gameStateList = ['start', 'playing', 'end', 'pause'];
  gameState: string = this.gameStateList[0];

  mazo: any[] = [];
  run = {
    banca: 100,
    apuesta: 20,
    racha: 0,
    pozo: 0
  };

  ngOnInit(): void {
    this.GenerarMazo();
  console.log(this.gameState)
  }

  ngAfterViewInit() {
    // Observa si ocurren cambios en los elemenots cartas
    // this.cardElements.changes.subscribe((changedObj) => {
    // });
  }

  private GenerarMazo(): void {
    // Genera un array de 52 cartas con objetos que contienen el valor y el palo de la carta
    let palos = ['corazones', 'diamantes', 'treboles', 'picas'];
    let valores = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const relative_path = '../../../../assets/images/mayor-menor/cards/';

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
          descartada: false
        });
      }
    }
    this.MezclarMazo();
  }

  Start(): void {
    console.log("Juego iniciado");

    this.gameState = this.gameStateList[1];
  }


  AcomodarMazo(i: number): string {
    const grupo = Math.floor(i / 3); 
    let transform = i * - 100 + grupo * 2;
    
    return transform + '%';
  }

  async MostrarCarta(index: number, cantDescartadas: number){
    const card = this.cardElements.get(index)?.nativeElement;
    const frontFace = card.querySelector('.card__face--front');
    const backFace = card.querySelector('.card__face--back');

    card.style.zIndex =  `${cantDescartadas}`;

    frontFace.classList.remove('hideFront');
    frontFace.classList.add('showFront');

    backFace.classList.add('hideBack');
    backFace.classList.remove('showBack');

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  OcultarCarta(){
    const frontFace = this.cardElements.last.nativeElement.querySelector('.card__face--front');
    const backFace = this.cardElements.last.nativeElement.querySelector('.card__face--back');
    
    frontFace.classList.remove('showFront');
    frontFace.classList.add('hideFront');
    
    backFace.classList.remove('hideBack');    
    backFace.classList.add('showBack');  
  }

  async RobarCarta(apuesta: string){
    let cartaRobada = null;
    let cartaPrevia = null;
    let cantDescartadas = 0;
    
    if(this.run.banca < this.run.apuesta){
      console.log('No tienes suficiente dinero para apostar');
      return;
    }

    for (let i = this.mazo.length - 1; i >= 0; i--) {
      if (!this.mazo[i].descartada) {
        cartaRobada = this.mazo[i];
        break;
      }
      cartaPrevia = this.mazo[i];
      cantDescartadas++;
    }

    // Valida si hay cartas para robar
    if(cartaRobada){      
      // Valida si hay una carta previa
      if(cartaPrevia){
        this.CalcularApuesta(apuesta, cartaPrevia, cartaRobada);
      }
      else console.log('No hay carta previa');

      this.MostrarCarta(this.mazo.indexOf(cartaRobada), cantDescartadas);
      cartaRobada.descartada = true;
    }
    else console.log('No hay cartas para robar');
  }

  CalcularApuesta(apuesta: string, cartaPrevia: any, cartaRobada: any){
    if(this.run.banca < this.run.apuesta){
      console.log('No tienes suficiente dinero para apostar');
      return;
    }
    this.run.banca -= this.run.apuesta;

    switch(cartaRobada.valor){
      case 'A':
        if(cartaPrevia.valor === 'A'){
          this.Empatar();
          break;
        }
        else if(cartaPrevia.valor === 'K'){
          if(apuesta === 'mayor'){
            this.ReiniciarRacha();
          }
          else {
            this.SumarPuntos(cartaRobada.valor);
          }
          break;
        }
        else if(cartaPrevia.valor === 'Q'){
          if(apuesta === 'mayor'){
            this.ReiniciarRacha();
          }
          else {
            this.SumarPuntos(cartaRobada.valor);
          }
          break;
        }
        else if(cartaPrevia.valor === 'J'){
          if(apuesta === 'mayor'){
            console.log('Perdiste, la carta robada es A y la anterior es J');
            this.ReiniciarRacha();
          }
          else {
            console.log('Ganaste, la carta robada es A y la anterior es J');
            this.SumarPuntos(cartaRobada.valor);
          }
          break;
        }
        else {
          if(apuesta === 'mayor'){
            this.ReiniciarRacha();
          }
          else {
            this.SumarPuntos(cartaRobada.valor);
          }
          break;
        }

      case 'K':
        if(cartaPrevia.valor === 'A'){
          if(apuesta === 'mayor'){
            this.SumarPuntos(cartaRobada.valor);
          }
          else {
            this.ReiniciarRacha();
          }
          break;
        }
        else if(cartaPrevia.valor === 'K'){
          this.Empatar();          
          break;
        }
        else if(cartaPrevia.valor === 'Q'){
          if(apuesta === 'mayor'){
            this.SumarPuntos(cartaRobada.valor);
          }
          else this.ReiniciarRacha();
          break;
        }
        else if(cartaPrevia.valor === 'J'){
          if(apuesta === 'mayor'){
            this.SumarPuntos(cartaRobada.valor);
          }
          else this.ReiniciarRacha();
          break;
        }
        else {
          if(apuesta === 'mayor'){
            this.SumarPuntos(cartaRobada.valor);
          }
          else this.ReiniciarRacha();
          break;
        }

        /// seguir
      case 'Q':
        if(cartaPrevia.valor === 'A'){
          if(apuesta === 'mayor'){
            this.SumarPuntos(cartaRobada.valor);
          }
          else {
            this.ReiniciarRacha();
          }
          break;
        }
        else if(cartaPrevia.valor === 'K'){
          if(apuesta === 'mayor'){
            this.ReiniciarRacha();
          }
          else {
            this.SumarPuntos(cartaRobada.valor);
          }
          break;
        }
        else if(cartaPrevia.valor === 'Q'){
          this.Empatar();
          break;
        }
        else if(cartaPrevia.valor === 'J'){
          if(apuesta === 'mayor'){
            this.SumarPuntos(cartaRobada.valor);
          }
          else {
            this.ReiniciarRacha();
          }
          break;
        }
        else {
          if(apuesta === 'mayor'){
            console.log('Ganaste, la carta robada es Q y la anterior es ' + cartaPrevia.valor);
          }
          else {
            console.log('Perdiste, la carta robada es Q y la anterior es ' + cartaPrevia.valor);
          }
          break;
        };
      
      case 'J':
        if(cartaPrevia.valor === 'A'){
          if(apuesta === 'mayor'){
            this.SumarPuntos(cartaRobada.valor);
          }
          else {
            this.ReiniciarRacha();
          }
          break;
        }
        else if(cartaPrevia.valor === 'K'){
          if(apuesta === 'mayor'){
            this.ReiniciarRacha();
          }
          else {
            this.SumarPuntos(cartaRobada.valor);
          }
          break;
        }
        else if(cartaPrevia.valor === 'Q'){
          if(apuesta === 'mayor'){
            this.ReiniciarRacha();
          }
          else {
            this.SumarPuntos(cartaRobada.valor);
          }
          break;
        }
        else if(cartaPrevia.valor === 'J'){
          this.Empatar();
          break;
        }
        else {
          if(apuesta === 'mayor'){
            this.SumarPuntos(cartaRobada.valor);
          }
          else {
            this.ReiniciarRacha();
          }
          break;
        }
      default:
        if(cartaPrevia.valor === 'A'){
          if(apuesta === 'mayor'){
            console.log('Ganaste, la carta robada es ' + cartaRobada.valor +' y la anterior es A');
            this.SumarPuntos(cartaRobada.valor);
          }
          else {
            console.log('Perdiste, la carta robada es ' + cartaRobada.valor +' y la anterior es A');
            this.ReiniciarRacha();
          }
          break;
        }
        else if(cartaPrevia.valor === 'K' || cartaPrevia.valor === 'Q' || cartaPrevia.valor === 'J'){
          if(apuesta === 'mayor'){
            this.ReiniciarRacha();
          }
          else {
            this.SumarPuntos(cartaRobada.valor);
          }
          break;
        }
        else{
          if(apuesta === 'mayor'){
            if(Number(cartaRobada.valor) > Number(cartaPrevia.valor)){
              this.SumarPuntos(cartaRobada.valor);
            }
            else if(Number(cartaPrevia.valor) === Number(cartaRobada.valor)){
              this.Empatar();
            }
            else {
              this.ReiniciarRacha();
            }
          }
          else {
            if(Number(cartaRobada.valor) < Number(cartaPrevia.valor)){
              this.SumarPuntos(cartaRobada.valor);
            }
            else if(Number(cartaPrevia.valor) === Number(cartaRobada.valor)){
              this.Empatar();
            }
            else {
              this.ReiniciarRacha();
            }
          }
        }
        break;
    }
  }

  SumarPuntos(valor: string){
    this.run.racha++;
    this.run.pozo = this.run.apuesta * this.run.racha;
    this.run.banca += this.run.pozo;
  }

  ReiniciarRacha(){
    if(this.run.banca < this.run.apuesta){
      console.log('Fin del juego');
    }
    this.run.racha = 0;
  }

  Empatar(){
    this.ReiniciarRacha();
  }

  MezclarMazo(): void {
    const mazoMezclado = [];
    let indices = [
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
      14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
      27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
      40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52
    ];
    // Se mezclan los indices con algoritmo de Fisher-Yates
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    console.log(this.mazo);
    console.log('semilla :', indices);

    const stringIndices = indices.map(indice => indice.toString()).join('');

    // Se recorre el array de índices y se reordena el mazo
    for (let i = 0; i < indices.length; i++) {
      const indiceOriginal = indices[i] - 1;
      mazoMezclado[i] = this.mazo[indiceOriginal];
    }
    this.mazo = mazoMezclado;
  }
}
