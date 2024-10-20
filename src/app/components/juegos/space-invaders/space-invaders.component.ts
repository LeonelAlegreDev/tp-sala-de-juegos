import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';

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
    vidas: 3,
    puntos: 0,
    velocidadEnemigos: 1,
  }
  private ctx: CanvasRenderingContext2D | null = null;
  private animationFrameId: number = 0;
  private lastTime: number = 0;
  private fps: number = 0;
  private keys: { [key: string]: boolean } = {}; // Estado de las teclas
  private bullets: Bullet[] = [];

  private player = {
    x: 0,
    y: 0,
    width: 40,
    height: 40,
    marginBottom: 100,
    speed: 10,
    shotDelay: 300, // ms
    canShoot: true,
    bulletSpeed: 5,
  };
  private enemies: Enemy[] = [];

  Start(){
    this.gameState = this.gameStateList[1]; // playing
    this.run = {
      vidas: 3,
      puntos: 0,
      velocidadEnemigos: 1,
    }
    this.CreateEnemies();

    setTimeout(() => {
      this.ctx = this.canvasElement.nativeElement.getContext('2d');
      this.canvasElement.nativeElement.width = 1000;
      this.canvasElement.nativeElement.height = 1000;
      this.player.x = this.canvasElement.nativeElement.width / 2 - this.player.width / 2,
      this.player.y = this.canvasElement.nativeElement.height - this.player.height - this.player.marginBottom;
      this.lastTime = performance.now();
      this.gameLoop(this.lastTime);
    }, 100);
  }

  
  gameLoop(currentTime: number): void {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    this.fps = 1000 / deltaTime; // Calcular FPS

    this.Update(deltaTime);
    this.Draw();

    this.animationFrameId = requestAnimationFrame((time) => this.gameLoop(time));
  }

  Update(deltaTime: number): void {
    // Actualiza el estado del juego usando deltaTime 
    this.UpdatePlayer();
  }

  Draw(): void {
    // Limpia el canvas
    this.ctx!.clearRect(0, 0, this.canvasElement.nativeElement.width, this.canvasElement.nativeElement.height);

    // Dibuja los elementos del juego (nave, invasores, etc.)
    this.DrawPlayer();
    this.DrawEnemies();
  }

  DrawPlayer(){
    this.ctx!.fillStyle = 'white';
    this.ctx!.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
  
    this.bullets.forEach((bullet, index) => {
      this.ctx!.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      bullet.y -= bullet.speed;
      if(bullet.y < 0){
        this.bullets.splice(index, 1);
      }
    });
  }

  UpdatePlayer(){
    // Movimiento del jugador
    if(this.keys['ArrowLeft']){
      if(this.player.x > 0){
        this.player.x -= this.player.speed;
      }
      else if(this.player.x < 0){
        this.player.x = 0;
      }
    }
    if(this.keys['ArrowRight']){
      if(this.player.x + this.player.width < this.canvasElement.nativeElement.width){
        this.player.x += this.player.speed;
      }
      else if(this.player.x + this.player.width > this.canvasElement.nativeElement.width){
        this.player.x = this.canvasElement.nativeElement.width - this.player.width;
      }
    }
    if(this.keys[' ']){
      if(this.player.canShoot){
        this.player.canShoot = false;
        console.log('Disparo');
        this.Disparar();

        setTimeout(() => {
          this.player.canShoot = true;
        }, this.player.shotDelay);
      }
    }
  }

  Disparar(){
    const bullet: Bullet = {
      x: this.player.x + this.player.width / 2,
      y: this.player.y,
      width: 5,
      height: 10,
      speed: this.player.bulletSpeed,
    }
    this.bullets.push(bullet);
  }

  CreateEnemies(){
    const rows = 5;
    const cols = 11;
    let spacingX = 40;
    const spacingY = 40;
    const width = 40;
    const height = 40;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) { 
        let x = 0;
        let y = 0;
        if(col === 0) {
          x = col * (width + spacingX) + spacingX / 2;
          y = row * (height + spacingY);
          console.log("col "+ col + ":", x, y);
        }
        else{
          x = col * (width + spacingX) + spacingX / 2;
          y = row * (height + spacingY);
          console.log("col "+ col + ":", x, y);
        }
        
        const enemy: Enemy = {
          x: x,
          y: y,
          width: width,
          height: height,
          speed: 1,
          bulletSpeed: 2,
          canShoot: false,
          shootDelay: 1000,
        };
        this.enemies.push(enemy);
      }
    }
    console.log("Enemigos creados: ", this.enemies);
  }
  
  DrawEnemies(){
    this.enemies.forEach(enemy => {
      this.ctx!.fillStyle = 'white';
      this.ctx!.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
      

    // this.bullets.forEach((bullet, index) => {
    //   this.ctx!.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    //   bullet.y -= bullet.speed;
    //   if(bullet.y < 0){
    //     this.bullets.splice(index, 1);
    //   }
    // });
  }

  @HostListener('window:keydown', ['$event'])
  HandleKeyboard(event: KeyboardEvent): void {
    this.keys[event.key] = true;
  }

  @HostListener('window:keyup', ['$event'])
  HandleKeyboardUp(event: KeyboardEvent): void {
    this.keys[event.key] = false;
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }
}

interface Bullet{
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}
interface Enemy{
  x: number,
  y: number,
  width: number;
  height: number;
  speed: number;
  bulletSpeed: number;
  canShoot: boolean;
  shootDelay: number;
}
interface Game{
  gridWidth: number;
  gridHeight: number;
  chunkSize: number;
  bitmap: number[][];
}