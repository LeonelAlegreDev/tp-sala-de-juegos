import { Component, ComponentRef, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Player } from './clases/player';
import { EnemyGroup } from './clases/enemy-group';
import { Enemy } from './interfaces/enemy';
import { Fuertes } from './clases/fuertes';
import { UI } from './clases/ui';

@Component({
  selector: 'app-space-invaders',
  standalone: true,
  imports: [],
  templateUrl: './space-invaders.component.html',
  styleUrl: './space-invaders.component.css'
})
export class SpaceInvadersComponent {
  @ViewChild('canvas') canvasElement!: ElementRef;

  gameStateList = ['start', 'playing', 'pause','game-over'];
  gameState = this.gameStateList[0];
  run = {
    puntos: 0,
  }
  private ctx: CanvasRenderingContext2D | null = null;
  private animationFrameId: number = 0;
  private lastTime: number = 0;
  private deltaTime: number = 0;
  private fps: number = 0;

  private player?: Player;
  private enemies?: EnemyGroup;
  private fuertes?: Fuertes;  
  private ui?: UI;

  private spriteMap: HTMLImageElement;

  constructor() { 
    this.spriteMap = new Image();
    this.spriteMap.src = '../../../../assets/images/space-invaders/space-invaders2.png';
  
  }

  Start(){
    this.gameState = this.gameStateList[1]; // playing
    this.run = {
      puntos: 0,
    }
    setTimeout(() => {
      this.ctx = this.canvasElement.nativeElement.getContext('2d');

      this.canvasElement.nativeElement.width = 1000;
      this.canvasElement.nativeElement.height = 1000;
      
      this.player = new Player(this.canvasElement, this.ctx!);
      this.enemies = new EnemyGroup(this.canvasElement, this.ctx!);
      this.fuertes = new Fuertes(this.canvasElement, this.ctx!);
      this.ui = new UI(this.canvasElement, this.ctx!);

      this.lastTime = performance.now();
      this.GameLoop(this.lastTime);
    }, 100);
  }
  
  private GameLoop(currentTime: number): void {
    this.deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    this.fps = 1000 / this.deltaTime; // Calcular FPS

    this.Update();
    this.Draw(); 

    this.animationFrameId = requestAnimationFrame((time) => this.GameLoop(time));
  }

  Update(): void {
    this.player?.Update(this.enemies!, this.fuertes!);
    this.enemies?.Update(this.deltaTime, this.player!, this.fuertes!);
    this.fuertes?.Update();
  }

  Draw(): void {
    this.ctx!.clearRect(0, 0, this.canvasElement.nativeElement.width, this.canvasElement.nativeElement.height);

    this.player?.Draw();
    this.enemies?.Draw(this.deltaTime);
    this.fuertes?.Draw();
    this.ui?.Draw(this.fps);
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}