import { Component, ViewChildren, QueryList, ElementRef, Renderer2, ViewChild } from '@angular/core';
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
  @ViewChildren('list') listContainer!: QueryList<ElementRef>;
  @ViewChildren('thumbnail') thumbnailContainer!: QueryList<ElementRef>;
  @ViewChild('carousel') carousel!: ElementRef;


  animationDelay = 3000; // Duración de la animación en ms
  autoTime = 8000; // Cambio automático en ms

  // Variables para controlar los timeouts
  runTimeOut: any = 0;
  runNextAuto: any = 0;

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit() {
    this.listItem.forEach( item => {
      // Muestra los elementos en consola
      // console.log(item.nativeElement);
    });

    this.listThumb.forEach( thumb => {
      // Muestra los elementos en consola
      // console.log(thumb.nativeElement);
    });

    this.GoNextAuto();
  }

  GoNext(){
    this.ShowSlider('next');
  }
  GoBack(){
    this.ShowSlider('prev');
  }
  GoNextAuto(){
    this.runNextAuto = setTimeout(() => {
      this.GoNext();
    }, this.autoTime);
  }

  // Función para mostrar el siguiente o el elemento anterior
  ShowSlider(type: string){

    // Si se quiere mostrar el siguiente elemento
    if(type === 'next'){
      // Obtener el primer elemento deslizable y la primera miniatura
      const firstSlide = this.listContainer.first.nativeElement.firstElementChild;
      const firstThumb = this.thumbnailContainer.first.nativeElement.firstElementChild;

       // Mover el primer elemento al final de la lista
      this.listContainer.first.nativeElement.appendChild(firstSlide);
      this.thumbnailContainer.first.nativeElement.appendChild(firstThumb);

       // Agregar la clase "next" al contenedor del carrusel
       this.renderer.addClass(this.carousel.nativeElement, 'next');
    }
    // Si se quiere mostrar el siguiente elemento
    else{
      // Obtener el último elemento deslizable y la última miniatura
      const lastSlide = this.listContainer.first.nativeElement.lastElementChild;
      const lastThumb = this.thumbnailContainer.first.nativeElement.lastElementChild;

      // Mover el último elemento al principio de la lista
      this.listContainer.first.nativeElement.prepend(lastSlide);
      this.thumbnailContainer.first.nativeElement.prepend(lastThumb);
      // Agregar la clase "prev" al contenedor del carrusel
      this.renderer.addClass(this.carousel.nativeElement, 'prev');
    }
    // Cancela cualquier transición en curso
    clearTimeout(this.runTimeOut);

    // Inicia una nueva transición para quitar las clases 
    //"next" o "prev" después del tiempo de transición
    this.runTimeOut = setTimeout(() => {
      this.renderer.removeClass(this.carousel.nativeElement, 'next');
      this.renderer.removeClass(this.carousel.nativeElement, 'prev');
    }, this.animationDelay);

    // Cancela el cambio automático en curso y reinicia uno nuevo
    clearTimeout(this.runNextAuto);
    this.runNextAuto = setTimeout(() => {
      this.GoNext();
    }, this.autoTime);
  }
}
