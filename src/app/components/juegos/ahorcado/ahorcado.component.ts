import { CommonModule, NgFor } from '@angular/common';
import { Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { IPuntaje, ScoreService } from '../../../services/score.service';
import { AuthService } from '../../../services/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-ahorcado',
  standalone: true,
  imports: [NgFor, CommonModule],
  templateUrl: './ahorcado.component.html',
  styleUrl: './ahorcado.component.css'
})
export class AhorcadoComponent {
  @ViewChildren('letra') letraElements!: QueryList<ElementRef>;
  @ViewChild('screenEnd') screenEnd!: ElementRef;
  @ViewChild('character') characterElement!: ElementRef;
  @ViewChildren('character') characterElements!: QueryList<ElementRef>;
  @ViewChildren('part') partElements!: QueryList<ElementRef>;

  constructor(private scroreService: ScoreService, private authService: AuthService) { }

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
    dificultadRonda: '',
    puntaje: 0,
    puntajeRonda: 0,
  };
  puntajesPorLetraAdivinada = {
    facil: 1,
    medio: 2,
    dificil: 3
  };
  factorPorPalabraAdivinada = {
    facil: 1,
    medio: 1.5,
    dificil: 2
  };
  palabrasFacil = ['GATO', 'CASA', 'PAIS', 'CIELO', 'AGUA', 'PERRO', 'MESA', 'LUNA', 'BARCO', 'CAMION'];
  palabrasMedio = ['CARACOL', 'LIBRO', 'PLANTA', 'ESCUELA', 'PELOTA', 'MUSICA', 'FUTBOL', 'LLUVIA', 'TORMENTA', 'GALAXIA'];
  palabrasDificil = ['UNIVERSO', 'MURCIELAGO', 'HORIZONTE', 'COMPUTADORA', 'EXTRAORDINARIO', 'HELICOPTERO', 'ELECTRONICA', 'CIENTIFICO'];

  puntajes: any[] = []; // Array para almacenar los puntajes obtenidos
  mejorPuntajeUsuario: number = 0; // Variable para almacenar el mejor puntaje del usuario actual

  ngOnInit(): void {
    this.cargarPuntajes(); // Cargar los puntajes al iniciar el componente
    this.authService.user$.subscribe(user => {
      if (user) {
        this.scroreService.obtenerMejorPuntajePorUsuario(user.uid).subscribe(puntaje => {
          this.mejorPuntajeUsuario = puntaje?.puntaje || 0;
        });
      }
    });
  }

  cargarPuntajes(): void {
    this.scroreService.obtenerPuntajes().subscribe({
      next: (data) => {
        // Ordenar los puntajes de mayor a menor y tomar solo los primeros 5
        this.puntajes = data
          .sort((a: IPuntaje, b: IPuntaje) => b.puntaje - a.puntaje)
          .slice(0, 5);
        console.log('Puntajes cargados y ordenados:', this.puntajes);
      },
      error: (err) => {
        console.error('Error al cargar los puntajes:', err);
      }
    });
  }

  guardarPuntaje(puntaje: IPuntaje) {
    this.scroreService.guardarPuntaje(puntaje);
  }

  Start() {
    console.log("Juego iniciado");
    this.gameState = this.gameStateList[4]; // dificulty
    this.InitCharacter();
  }

  async Adivinar(letra: string) {
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
        if (this.run.palabra[i].valor === letra) {
          this.run.palabra[i].adivinada = true;
          adivinada = true;
        }
        if (!this.run.palabra[i].adivinada) {
          esGanador = false;
        }
      }

      if (adivinada) {
        this.run.puntajeRonda += this.puntajesPorLetraAdivinada[this.run.dificultadRonda as keyof typeof this.puntajesPorLetraAdivinada];
        for (let i = 0; i < this.letraElements.length; i++) {
          if (this.letraElements.toArray()[i].nativeElement.innerText === letra) {
            this.letraElements.toArray()[i].nativeElement.classList.add('adivinada');
            break;
          }
        }

        if (esGanador) {
          this.run.puntajeRonda = Math.floor(this.run.puntajeRonda * this.factorPorPalabraAdivinada[this.run.dificultadRonda as keyof typeof this.factorPorPalabraAdivinada]);
          this.run.puntaje += this.run.puntajeRonda;
          this.gameState = this.gameStateList[2]; // end
          this.run.result = 'win';
          console.log("Ganaste");
        }
      } else {
        for (let i = 0; i < this.letraElements.length; i++) {
          if (this.letraElements.toArray()[i].nativeElement.innerText === letra) {
            this.letraElements.toArray()[i].nativeElement.classList.add('equivocada');
            break;
          }
        }

        this.run.vidas--;
        console.log("Perdiste 1 vida: " + this.run.vidas);
        this.MostrarParte();

        if (this.run.vidas === 0) {
          const nuevoPuntaje = this.run.puntaje;

          // Actualizar mejor puntaje del usuario si es necesario
          if (nuevoPuntaje > this.mejorPuntajeUsuario) {
            this.mejorPuntajeUsuario = nuevoPuntaje;
          }

          // Agregar el puntaje actual a la lista de puntajes
          this.puntajes.push({
            idUsuario: 'currentUser', // Placeholder, replace with actual user ID if available
            email: 'currentUserEmail', // Placeholder, replace with actual user email if available
            puntaje: nuevoPuntaje
          });

          // Ordenar y mantener solo los 5 mejores puntajes
          this.puntajes = this.puntajes
            .sort((a, b) => b.puntaje - a.puntaje)
            .slice(0, 5);

          // Guardar el puntaje en la base de datos
          try {
            const user = await firstValueFrom(this.authService.user$);
            const puntaje: IPuntaje = {
              idUsuario: user?.uid || 'unknown',
              email: user?.email || 'unknown',
              puntaje: nuevoPuntaje
            };
            await this.scroreService.guardarPuntaje(puntaje);
          } catch (error) {
            console.error('Error al guardar el puntaje en la base de datos:', error);
          }

          this.gameState = this.gameStateList[2]; // end
          this.run.result = 'lose';
          this.run.dificultadRonda = '';
          console.log("Fin del juego");
        }
      }
    } else {
      console.log("No te quedan vidas");
    }
  }

  ElegirPalabra(dificultad: string) {
    let palabra_array = [];
    let palabraElegida: string = "DEFAULT";
    this.run.dificultadRonda = dificultad;
    this.run.puntajeRonda = 0;
    this.run.vidas = 6;
    this.run.letrasUsadas = [];

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
    this.run.vidas = 6;

    // Reiniciar visibilidad de las partes del personaje
    this.partElements.forEach((part) => {
      part.nativeElement.classList.remove('visible');
    });

    // Reinicializar las partes del personaje
    this.InitCharacter();
  }

  Restart() {
    this.gameState = this.gameStateList[0]; // start
    this.run.vidas = 6;
    this.run.palabra = [];
    this.run.letras = [];
    this.run.result = '';
    this.run.dificultadRonda = '';
    this.run.puntaje = 0;
    this.run.puntajeRonda = 0;

    this.letraElements.forEach((letra) => {
      letra.nativeElement.classList.remove('adivinada');
    });
    this.letraElements.forEach((letra) => {
      letra.nativeElement.classList.remove('equivocada');
    });
    this.run.letrasUsadas = [];

    // Reiniciar visibilidad de las partes del personaje
    this.partElements.forEach((part) => {
      part.nativeElement.classList.remove('visible');
    });

    // Reinicializar las partes del personaje
    this.InitCharacter();
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

    // Reinicializar el estado de las partes del personaje
    this.run.partesPersonaje = {
      cabeza: { elemento: this.partElements.get(0)!, visible: false },
      sombrero: { elemento: this.partElements.get(1)!, visible: false },
      brazoIzq: { elemento: this.partElements.get(2)!, visible: false },
      brazoDer: { elemento: this.partElements.get(3)!, visible: false },
      cuerpo: { elemento: this.partElements.get(4)!, visible: false },
      piernaIzq: { elemento: this.partElements.get(5)!, visible: false },
      piernaDer: { elemento: this.partElements.get(6)!, visible: false }
    };

    // Asegurarse de que todas las partes estén ocultas inicialmente
    this.partElements.forEach((part) => {
      part.nativeElement.classList.remove('visible');
    });
  }

  VerPuntuacion() {
    this.gameState = this.gameStateList[3]; // score
  }
}

