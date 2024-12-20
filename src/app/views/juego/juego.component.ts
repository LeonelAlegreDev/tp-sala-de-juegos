import { Component, ElementRef, Renderer2, ViewChild, ViewContainerRef } from '@angular/core';
import { MenuComponent } from "../../components/menu/menu.component";
import { Observable } from 'rxjs';
import { NgFor, NgStyle } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AhorcadoComponent } from '../../components/juegos/ahorcado/ahorcado.component';
import { MayorMenorComponent } from '../../components/juegos/mayor-menor/mayor-menor.component';
import { PreguntadosComponent } from '../../components/juegos/preguntados/preguntados.component';
import { SpaceInvadersComponent } from '../../components/juegos/space-invaders/space-invaders.component';

@Component({
  selector: 'app-juego',
  standalone: true,
  imports: [MenuComponent],
  templateUrl: './juego.component.html',
  styleUrl: './juego.component.css'
})
export class JuegoComponent {
  @ViewChild('viewport') viewportElement!: ElementRef;
  @ViewChild('game') gameElement!: ElementRef;
  @ViewChild('vcr', { read: ViewContainerRef }) vcr!: ViewContainerRef;
  
  componentList = [AhorcadoComponent, MayorMenorComponent, PreguntadosComponent, SpaceInvadersComponent];
  juegosList = ["Ahorcado", "MayorMenor", "Preguntados", "SpaceInvaders"];

  private viewportReady$: Observable<boolean>;
  private resizeObserver: ResizeObserver;

  constructor(private renderer: Renderer2,
    private route: ActivatedRoute,) 
  {
    // Observable para saber si el viewportElement está listo
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
    // Espera a que el viewportElement esté listo para redimensionar el viewport
    this.viewportReady$.subscribe(() => {
      this.ResizeViewport();
      this.CargarJuego();
    });
  }

  ngAfterViewInit() {
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

  CargarJuego(): void {
    this.route.paramMap.subscribe(params => {
      let idJuego = params.get('id')?.replace('-','');
      let component = null;

      this.juegosList.forEach(juego => {
        if (juego.toLocaleLowerCase() === idJuego) {
          component = juego;
        }
      });

      if(component){
        console.log("Cargando juego:", idJuego);
        this.vcr.clear();
        component = this.componentList[this.juegosList.indexOf(component)];
        const compRef = this.vcr.createComponent(component as any);
        compRef.changeDetectorRef.detectChanges();
      }
      else {
        console.log("Juego inexistente");
      }
    });
  }
}
