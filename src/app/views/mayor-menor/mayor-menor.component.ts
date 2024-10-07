import { Component, ViewChildren, ElementRef, QueryList, Renderer2, ViewChild, HostListener } from '@angular/core';
import { MenuComponent } from '../../components/menu/menu.component';
import { NgFor, NgStyle } from '@angular/common';
import { fromEvent, Observable } from 'rxjs';

@Component({
  selector: 'app-mayor-menor',
  standalone: true,
  imports: [MenuComponent, NgFor, NgStyle],
  templateUrl: './mayor-menor.component.html',
  styleUrl: './mayor-menor.component.css'
})
export class MayorMenorComponent {
  @ViewChildren('card') cardElements!: QueryList<ElementRef>;
  @ViewChild('viewport') viewportElement!: ElementRef;
  @ViewChild('game') gameElement!: ElementRef;

  // Añadir Viewchild para acceder al elemento #mazos
  isGameStarted: boolean = false;
  mazo: any[] = [];
  private viewportReady$: Observable<boolean>;
  private resizeObserver: ResizeObserver;

  constructor(private renderer: Renderer2) {
    this.viewportReady$ = new Observable(observer => {
      const interval = setInterval(() => {
        if (this.viewportElement) {
          clearInterval(interval);
          observer.next(true);
          observer.complete();
        }
      }, 50);
    });

    // Inicializa el resizeObserver
     this.resizeObserver = new ResizeObserver(entries => {
      entries.forEach(entry => {
        // Validar si el viewportElement esta listo
        if (!this.viewportElement) return;
        
        this.ResizeViewport();
      });
    });
  }
  

  ngOnDestroy() {
    this.resizeObserver.disconnect();
  }

  ngOnInit(): void {
    this.GenerarMazo();
    
    // Espera a que el viewportElement esté listo para redimensionar el viewport
    this.viewportReady$.subscribe(() => {
      this.ResizeViewport();
    });
  }

  ngAfterViewInit() {
    this.cardElements.changes.subscribe((changedObj) => {
    });

    this.resizeObserver.observe(this.gameElement.nativeElement);
  }

  ResizeViewport() {
    const viewportElement = this.viewportElement.nativeElement;

    const gameViewportHeight = this.gameElement.nativeElement.clientHeight;
    const gameViewportWidth = this.gameElement.nativeElement.clientWidth;
    const minDimension = Math.min(gameViewportHeight, gameViewportWidth);

    // Sabiendo que la resolucion del viewportElement es de 1000px x 1000px
    // y eligiendo el menor de los lados del contenedor
    // el tamaño del viewportElement debe tener como largo de de sus lados
    // el valor del lado menor del contenedor
    const scale = (minDimension / 1000);    
    
    viewportElement.style.transform = `scale(${scale})`;
    viewportElement.style.transformOrigin = 'center';
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
  }

  Start(): void {
    console.log("Juego iniciado");

    this.isGameStarted = true;
  }


  AcomodarMazo(i: number): string {
    const grupo = Math.floor(i / 3); 
    let transform = i * - 100 + grupo * 2;
    
    return transform + '%';
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
