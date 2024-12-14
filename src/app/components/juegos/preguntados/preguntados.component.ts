import { NgFor, NgStyle } from '@angular/common';
import { Component, ElementRef, ViewChild, ViewChildren, QueryList, inject } from '@angular/core';
import { MarvelService } from '../../../services/marvel.service';
import { PokemonService } from '../../../services/pokemon.service';

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
  @ViewChild('modal') modalElement!: ElementRef;
  private marvelService = inject(MarvelService);
  private pokemonService = inject(PokemonService);

  gameStateList = ['start', 'girando', 'respondiendo'];
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
    vidas: 3,
    puntos: 0,
    racha: 0,
    maxRacha: 0,
    preguntasAcertadas: 0,
    preguntasRespondidas: 0,
    puntosAcierto: 100,
  };
  modalData = {
    header: 'Ejemplo',
    body: 'Ejemplo mas largo',
    nextState: '',
    buttonText: 'Continuar'
  }

  marvelData: any = {
    characters: []
  };

  pregunta: any = {
    consigna: '',
    opciones: [],
    img: '',
    opcionCorrecta: ''
  }

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
        // this.CrearPreguntaMarvel();
        this.CrearPreguntaPokemon();
      }, 2000);
    }, duracion);
  }

  CrearPreguntaPokemon(){
    const result = this.pokemonService.GetPokemons();
    this.pregunta.consigna = "¿Como se llama este pokemon?";
    this.pregunta.opciones = [];

    result.subscribe((result: any) => {
      // Selecciona las opcion correcta
      const indexCorrecto = Math.floor(Math.random() * result.length);
      this.pregunta.opcionCorrecta = result[indexCorrecto].name;
      this.pregunta.opciones.push(this.pregunta.opcionCorrecta);
      this.pregunta.img = result[indexCorrecto].image;
      let findOpcion = false;

      // Selecciona 3 opciones incorrectas
      for(let i = 0; i < 3; i++){
        let opcionAleatoria = result[Math.floor(Math.random() * result.length)].name;
        
        do{
          // Si la opcion aleatoria ya se encuentra en las opciones, se busca otra
          if(this.pregunta.opciones.includes(opcionAleatoria)){
            findOpcion = false;
            opcionAleatoria = result[Math.floor(Math.random() * result.length)].name;
          }
          else findOpcion = true;
        }while(!findOpcion);

        this.pregunta.opciones.push(opcionAleatoria);
      }

      // Mezcla las opciones
      this.pregunta.opciones.sort(() => Math.random() - 0.5);

      console.log(this.pregunta)
    });
  }

  ElegirOpcion(opcion: string){
    console.log("Opcion elegida: ", opcion);
    this.run.preguntasRespondidas++;

    if(opcion === this.pregunta.opcionCorrecta){
      console.log("Respuesta correcta");
      this.Ganar();
    }
    else{
      console.log("Respuesta incorrecta");
      this.Perder();
    }
    this.canSpin = true;
  }

  Ganar(){
    this.run.racha++;
    this.run.puntos += this.run.racha * this.run.puntosAcierto;
    this.run.preguntasAcertadas++;
    if(this.run.racha > this.run.maxRacha){
      this.run.maxRacha = this.run.racha;
    }
    this.run.categoria = '';
    this.modalData.header = '¡Respuesta correcta!';
    this.modalData.body = '¡Has ganado ' + this.run.racha * this.run.puntosAcierto + ' puntos!';
    this.modalData.nextState = this.gameStateList[1]; // girando
    this.modalData.buttonText = 'Continuar';
    this.MostrarModal();
  }
  Perder(){ 
    this.run.racha = 0;
    this.run.vidas--;

    if(this.run.vidas === 0){
      console.log("Fin del juego");
      this.modalData.header = '¡Fin del juego!';
      this.modalData.body = `Respondiste ${this.run.preguntasAcertadas} preguntas correctamente y obtuviste ${this.run.puntos} puntos.`;
      this.modalData.nextState = this.gameStateList[0]; // start
      this.modalData.buttonText = 'Volver al inicio';
      this.MostrarModal();
    }
    else{
      this.run.categoria = '';
      this.modalData.header = '¡Respuesta incorrecta!';
      this.modalData.body = '¡Has perdido una vida!';
      this.modalData.nextState = this.gameStateList[1]; // girando
      this.modalData.buttonText = 'Continuar';
      this.MostrarModal();
    }
  }

  onModalClick(event: MouseEvent) {
    const modalElement = event.target as HTMLElement;
    const cardElement = modalElement.closest('.card');
    
    if (!cardElement) {
      this.modalElement.nativeElement.style.display = 'none';
      this.Continuar();
    }
  }

  MostrarModal(){
    this.modalElement.nativeElement.style.display = 'flex';
  }
  Continuar(){
    this.modalElement.nativeElement.style.display = 'none';
    this.gameState = this.modalData.nextState;
  }

  
  // CrearPreguntaMarvel(){
  //   let characters: any;

  //   this.marvelService.GetCharacters().subscribe(characters => {
  //     this.marvelData.characters = characters;
  //     console.log(this.marvelData.characters);
  //   });
  // }
}
