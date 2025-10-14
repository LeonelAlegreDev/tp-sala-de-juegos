import { NgFor } from '@angular/common';
import { Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';

@Component({
  selector: 'app-ahorcado',
  standalone: true,
  imports: [NgFor],
  templateUrl: './ahorcado.component.html',
  styleUrl: './ahorcado.component.css'
})
export class AhorcadoComponent {
  @ViewChildren('letra') letraElements!: QueryList<ElementRef>;
  @ViewChild('screenEnd') screenEnd!: ElementRef;
  @ViewChild('character') characterElement!: ElementRef;
  @ViewChildren('character') characterElements!: QueryList<ElementRef>;
  @ViewChildren('part') partElements!: QueryList<ElementRef>;

  gameStateList = ['start', 'playing', 'end', 'score', 'dificulty'];
  gameState = this.gameStateList[0];
  teclado = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ];
  run = {
    palabra: [] as { valor: string; adivinada: boolean }[],
    vidas: 6,
    letras: [] as string[],
    partesPersonaje: {} as any,
    letrasUsadas: [] as string[],
    result: '',
  };
  palabrasFacil = ['GATO', 'CASA', 'PAIS', 'CIELO', 'AGUA', 'PERRO', 'MESA', 'LUNA', 'BARCO', 'CAMION'];
  palabrasMedio = ['CARACOL', 'LIBRO', 'PLANTA', 'ESCUELA', 'PELOTA', 'MUSICA', 'FUTBOL', 'LLUVIA', 'TORMENTA', 'GALAXIA'];
  palabrasDificil = ['UNIVERSO', 'MURCIELAGO', 'HORIZONTE', 'COMPUTADORA', 'EXTRAORDINARIO', 'HELICOPTERO', 'ELECTRONICA', 'CIENTIFICO'];

  Start() {
    console.log("Juego iniciado");
    this.gameState = this.gameStateList[4]; // dificulty
    this.InitCharacter();
  }
  Adivinar(letra: string) {
    if (this.run.vidas > 0) {
      let adivinada = false;
      let esGanador = true;


      // Valida si la letra ya fue usada
      for (let j = 0; j < this.run.letrasUsadas.length; j++) {
        if (this.run.letrasUsadas[j] === letra) {
          console.log("Letra desactivada");
          return;
        }
      }
      this.run.letrasUsadas.push(letra);

      // Comprueba si se ha adivinado la letra
      for (let i = 0; i < this.run.palabra.length - 1; i++) {
        //Valida si la letra ingresada es igual a la letra de la palabra
        if (this.run.palabra[i].valor === letra) {
          this.run.palabra[i].adivinada = true;
          adivinada = true;
        }
        // Si no hay letras por adivinar, el jugador gana
        if (!this.run.palabra[i].adivinada) {
          esGanador = false;
        }
      }

      if (adivinada) {
        // Marca el elemento como adivinado       
        for (let i = 0; i < this.letraElements.length; i++) {
          if (this.letraElements.toArray()[i].nativeElement.innerText === letra) {
            this.letraElements.toArray()[i].nativeElement.classList.add('adivinada');
            break
          }
        }

        if (esGanador) {
          this.gameState = this.gameStateList[2]; // end
          this.run.result = 'win';
          console.log("Ganaste");
        }
      }
      else {
        for (let i = 0; i < this.letraElements.length; i++) {
          if (this.letraElements.toArray()[i].nativeElement.innerText === letra) {
            this.letraElements.toArray()[i].nativeElement.classList.add('equivocada');
            break
          }
        }

        this.run.vidas--;
        console.log("Perdiste 1 vida: " + this.run.vidas);
        this.MostrarParte();

        if (this.run.vidas === 0) {
          this.gameState = this.gameStateList[2]; // end
          this.run.result = 'lose';
          console.log("Fin del juego");
        }
      }
    }
    else {
      console.log("No te quedan vidas");
    }
  }

  ElegirPalabra(dificultad: string) {
    document.getElementsByClassName('screen-dificult').item(0)!.classList.add('hidden');
    let palabra_array = [];
    let palabraElegida: string = "DEFAULT";

    switch (dificultad) {
      case 'facil':
        palabraElegida = this.palabrasFacil[Math.floor(Math.random() * this.palabrasFacil.length)];
        break;
      case 'medio':
        palabraElegida = this.palabrasMedio[Math.floor(Math.random() * this.palabrasMedio.length)];
        break;
      case 'dificil':
        palabraElegida = this.palabrasDificil[Math.floor(Math.random() * this.palabrasDificil.length)];
        break;
    }
    palabra_array = palabraElegida.split('');

    for (let i = 0; i < palabra_array.length; i++) {
      let letra = {
        valor: palabra_array[i],
        adivinada: false
      }
      if (i === 0 || i === palabra_array.length - 1) {
        letra.adivinada = true;
      }
      this.run.palabra.push(letra);
      this.gameState = this.gameStateList[1]; // playing
    }
    console.log(this.run.palabra)
  }

  Continuar() {
    this.gameState = this.gameStateList[4]; // dificulty
    this.run.letrasUsadas = [];
    this.run.palabra = [];
  }
  Restart() {
    this.gameState = this.gameStateList[0]; // start
    this.run.vidas = 6;
    this.run.palabra = [];
    this.run.letras = [];
    this.run.result = '';
    this.screenEnd.nativeElement.classList.add('hidden');
    this.letraElements.forEach((letra) => {
      letra.nativeElement.classList.remove('adivinada');
    });
    this.letraElements.forEach((letra) => {
      letra.nativeElement.classList.remove('equivocada');
    });
    this.run.letrasUsadas = [];
  }

  MostrarParte() {
    switch (this.run.vidas) {
      case 5:
        this.run.partesPersonaje.cabeza.visible = true;
        this.run.partesPersonaje.cabeza.elemento.nativeElement.classList.add('visible');
        this.run.partesPersonaje.sombrero.visible = true;
        this.run.partesPersonaje.sombrero.elemento.nativeElement.classList.add('visible');
        break;

      case 4:
        this.run.partesPersonaje.brazoIzq.visible = true;
        this.run.partesPersonaje.brazoIzq.elemento.nativeElement.classList.add('visible');
        break;

      case 3:
        this.run.partesPersonaje.brazoDer.visible = true;
        this.run.partesPersonaje.brazoDer.elemento.nativeElement.classList.add('visible');
        break;

      case 2:
        this.run.partesPersonaje.cuerpo.visible = true;
        this.run.partesPersonaje.cuerpo.elemento.nativeElement.classList.add('visible');
        break;

      case 1:
        this.run.partesPersonaje.piernaIzq.visible = true;
        this.run.partesPersonaje.piernaIzq.elemento.nativeElement.classList.add('visible');
        break;

      case 0:
        this.run.partesPersonaje.piernaDer.visible = true;
        this.run.partesPersonaje.piernaDer.elemento.nativeElement.classList.add('visible');
        break;
    }
  }

  InitCharacter() {
    if (this.partElements.length === 0) {
      setTimeout(() => {
        this.InitCharacter();
      }, 100);
      return;
    }

    this.run.partesPersonaje = {
      cabeza: { elemento: this.partElements.get(0)!, visible: false },
      sombrero: { elemento: this.partElements.get(1)!, visible: false },
      brazoIzq: { elemento: this.partElements.get(2)!, visible: false },
      brazoDer: { elemento: this.partElements.get(3)!, visible: false },
      cuerpo: { elemento: this.partElements.get(4)!, visible: false },
      piernaIzq: { elemento: this.partElements.get(5)!, visible: false },
      piernaDer: { elemento: this.partElements.get(6)!, visible: false }
    };
  }

  VerPuntuacion() {
    this.gameState = this.gameStateList[3]; // score
  }
}
