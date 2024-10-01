import { Component, ViewChildren, QueryList, ElementRef, Renderer2 } from '@angular/core';
import { MenuComponent } from '../../components/menu/menu.component';

@Component({
  selector: 'app-juegos',
  standalone: true,
  imports: [MenuComponent],
  templateUrl: './juegos.component.html',
  styleUrl: './juegos.component.css'
})
export class JuegosComponent {
  // TODO: Integrar codigo Javascript
  @ViewChildren('listItem') listItem!: QueryList<ElementRef>;
  @ViewChildren('listThumb') listThumb!: QueryList<ElementRef>;

  animationTime = 3000; // Duración de la animación en ms
  autoTime = 70000; // Cambio automático en ms

  // Variables para controlar los timeouts
  // continuara ...
  runTimeOut: number = 0;
  runNextAuto: number = 0;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit() {
    this.listItem.forEach( item => {
      // Muestra los elementos en consola
      console.log(item.nativeElement);
    });

    this.listThumb.forEach( thumb => {
      // Muestra los elementos en consola
      console.log(thumb.nativeElement);
    });
  }

  GoNext(){

  }
  GoBack(){

  }
}
