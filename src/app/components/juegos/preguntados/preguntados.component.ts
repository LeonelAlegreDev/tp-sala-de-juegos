import { NgFor, NgStyle } from '@angular/common';
import { Component, ElementRef, ViewChild, ViewChildren, QueryList } from '@angular/core';

@Component({
  selector: 'app-preguntados',
  standalone: true,
  imports: [NgFor, NgStyle],
  templateUrl: './preguntados.component.html',
  styleUrls: ['./preguntados.component.css']
})
export class PreguntadosComponent {
  @ViewChildren('row') rowElements!: QueryList<ElementRef>;
  @ViewChildren('card') cardElements!: QueryList<ElementRef>;
  @ViewChild('selector') selector!: ElementRef;

  gameStateList = ['start', 'girando', 'respondiendo', 'gameOver'];
  gameState = this.gameStateList[0];
  categorias = ['Historia', 'Geografía', 'Ciencia', 'Deportes', 'Arte', 'Entretenimiento'];
  tarjetas = [
    {
      categoria: 'Historia',
      imgUrl: '../../../../assets/images/preguntados/historia-icon.png'
    },
    {
      categoria: 'Geografía',
      imgUrl: '../../../../assets/images/preguntados/geografia-icon.png'
    },
    {
      categoria: 'Ciencia',
      imgUrl: '../../../../assets/images/preguntados/ciencia-icon.png'
    },
    {
      categoria: 'Deportes',
      imgUrl: '../../../../assets/images/preguntados/deportes-icon.png'
    },
    {
      categoria: 'Arte',
      imgUrl: '../../../../assets/images/preguntados/arte-icon.png'
    },
    {
      categoria: 'Entretenimiento',
      imgUrl: '../../../../assets/images/preguntados/entretenimiento-icon.png'
    }
  ];
  canSpin = true;
  run = {
    categoria: '',
    vidas: 3
  };

  // TODO: Crear urls de imagenes para las categorias

  Start(){
    console.log("Juego iniciado");
    this.gameState = this.gameStateList[1]; // girando
  }

  async SpinWheel(){
    console.log("Girando la ruleta");
    this.canSpin = false;
    const selector = this.selector.nativeElement.getBoundingClientRect();
    const selectorCenter = selector.x + selector.width / 2;
    let duracion = Math.floor(Math.random() * 3000) + 2000;
    
    // Aplica animación css a cada fila
    this.rowElements.forEach(row => {
      row.nativeElement.classList.add('row-animate-constant');
      row.nativeElement.style.animationDuration =  0.8 + 's';
      row.nativeElement.style.animationPlayState = 'running';
    });

    // Detiene la animacion y determina la carta más cercana al selector
    setTimeout(async () => {
      let smallestDistance: number | null = null;
      let closestCard;

      // Detiene la animacion
      this.rowElements.forEach(row => {
        row.nativeElement.style.animationPlayState = 'paused';
      });

      const esperar = await new Promise(resolve => setTimeout(resolve, 300));
      // Determina la carta más cercana al selector
      this.cardElements.forEach(card => {
        let cardPosition = card.nativeElement.getBoundingClientRect();
        let cardCenter = cardPosition.x + (cardPosition.width / 2);
        let distance = cardCenter - selectorCenter;
        
        if(smallestDistance === null){
          smallestDistance = distance;
          closestCard = card;
        }
        else if(Math.abs(distance) < Math.abs(smallestDistance)){
          smallestDistance = distance;
          closestCard = card;
        }
      });
      console.log("Categoria: ", closestCard!.nativeElement.getAttribute('data-categoria'));
      this.run.categoria = closestCard!.nativeElement.getAttribute('data-categoria');
    
      setTimeout(() => {
        console.log("Seleccionando pregunta");
        this.gameState = this.gameStateList[2]; // respondiendo
      }, 2000);
    }, duracion);
  }
}
