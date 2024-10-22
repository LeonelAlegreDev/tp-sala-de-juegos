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
  private deltaTime: number = 0;
  private fps: number = 0;
  private keys: { [key: string]: boolean } = {}; // Estado de las teclas

  private player = {
    x: 0,
    y: 0,
    width: 40,
    height: 40,
    speed: 6,
    shotDelay: 10, // ms
    canShoot: true,
    bulletSpeed: 4,
    bullets: [] as Bullet[],
  };
  private enemies: Enemy[] = [];
  private fuertes: Fuerte[] = [];
  private spriteMap: HTMLImageElement;

  constructor() { 
    this.spriteMap = new Image();
    this.spriteMap.src = '../../../../assets/images/space-invaders/space-invaders2.png';
  }

  Start(){
    this.gameState = this.gameStateList[1]; // playing
    this.run = {
      vidas: 3,
      puntos: 0,
      velocidadEnemigos: 1,
    }
    this.CreateEnemies();
    this.CreateFuertes();

    setTimeout(() => {
      this.ctx = this.canvasElement.nativeElement.getContext('2d');
      this.canvasElement.nativeElement.width = 1000;
      this.canvasElement.nativeElement.height = 1000;
      this.player.x = this.canvasElement.nativeElement.width / 2 - this.player.width / 2,
      this.player.y = this.canvasElement.nativeElement.height - this.player.height - 35;
      this.lastTime = performance.now();
      this.gameLoop(this.lastTime);
    }, 100);
  }

  
  gameLoop(currentTime: number): void {
    this.deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    this.fps = 1000 / this.deltaTime; // Calcular FPS

    this.Update();
    this.Draw();

    this.animationFrameId = requestAnimationFrame((time) => this.gameLoop(time));
  }

  Update(): void {
    // Actualiza el estado del juego usando deltaTime 
    this.UpdatePlayer();
    this.UpdateEnemies();
  }

  Draw(): void {
    // Limpia el canvas
    this.ctx!.clearRect(0, 0, this.canvasElement.nativeElement.width, this.canvasElement.nativeElement.height);

    // Dibuja los elementos del juego (nave, invasores, etc.)
    this.DrawPlayer();
    this.DrawEnemies();
    this.DrawFuertes();
  }

  DrawPlayer(){
    this.ctx!.fillStyle = 'white';
    this.ctx!.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
  
    this.player.bullets.forEach((bullet: Bullet, index: number) => {
      this.ctx!.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
      bullet.y -= bullet.speed;
      if(bullet.y < 0){
        this.player.bullets.splice(index, 1);
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
      width: 9,
      height: 20,
      speed: this.player.bulletSpeed,
    }
    this.player.bullets.push(bullet);
  }

  CreateEnemies(){
    const rows = 5;
    const cols = 10;
    const spacingX = 33;
    const spacingY = 20;
    const width = 55;
    const height = 55;
    const lateralPadding = 80;
    const pointsHeight = 65;
    const specialHeight = 65;
    const sprites = this.SpliceEnemies(this.spriteMap);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) { 
        let frames: any;
        let x = lateralPadding + col * (width + spacingX);
        let y = (spacingY + height) * row + pointsHeight + specialHeight;
        let colisionWidth = 55;
        let colisionHeight = 55;
        let colisionX = x;
        let colisionY = y;

        switch(row){
          case 0:
            colisionX += 15;
            colisionWidth -= 29;
            colisionY += 15;
            colisionHeight -= 29;
            frames = [sprites[7], sprites[8]];
            break;
          
          case 1:
          case 2:
            colisionX += 11;
            colisionWidth -= 19;
            colisionY += 13;
            colisionHeight -= 24;
            frames = [sprites[0], sprites[1]];
            break;
          
          case 3:
          case 4:
            colisionX += 11;
            colisionWidth -= 19;
            colisionY += 13;
            colisionHeight -= 27;
            frames = [sprites[14], sprites[15]];
            break;
        }

        if(col === 0) x = lateralPadding;

        const enemy: Enemy = {
          x: x,
          y: y,
          width: width,
          height: height,
          speed: 1,
          maxSpeed: 5,
          bulletSpeed: 2,
          canShoot: false,
          shootDelay: 1000,
          sprites: frames,
          colisionWidth: colisionWidth,
          colisionHeight: colisionHeight,
          colisionX: colisionX,
          colisionY: colisionY,
          frameIndex: 0,
          animationTimer: 0,
          direction: 1,
        };
        this.enemies.push(enemy);
      }
    }
  }
  
  DrawEnemies(){
    this.enemies.forEach(enemy => {
      const sprite = enemy.sprites[enemy.frameIndex];
      this.ctx!.drawImage(sprite, enemy.x, enemy.y);
        
      this.ctx!.beginPath();
      this.ctx!.rect(enemy.colisionX, enemy.colisionY, enemy.colisionWidth, enemy.colisionHeight);
      this.ctx!.strokeStyle = 'red';
      this.ctx!.stroke();

      // Actualizar el temporizador de animación
      enemy.animationTimer += this.deltaTime;
      if (enemy.animationTimer >= 500) { // 500 ms = 0.5 segundos
        enemy.frameIndex = (enemy.frameIndex + 1) % enemy.sprites.length;
        enemy.animationTimer = 0;
      }
    });
  }

  UpdateEnemies(): void {
    this.enemies.forEach((enemy, enemyIndex) => {
      
      // Comprueba la colision con las balas
      this.player.bullets.forEach((bullet, bulletIndex) => {
        if (this.IsColliding(enemy, bullet)) {
          // Eliminar la bala y el enemigo
          this.player.bullets.splice(bulletIndex, 1);
          this.enemies.splice(enemyIndex, 1);
          console.log(this.enemies.length)
          // Incrementar puntos o cualquier otra lógica de juego
          this.run.puntos += 10;
          return;
        }
      });

      if(this.enemies.length === 1){
        enemy.speed = enemy.maxSpeed * enemy.direction;
      }

      // Mueve a los enemigos hacia la izquierda hasta el borde del canvas
      enemy.x += enemy.speed * enemy.direction;
      enemy.colisionX += enemy.speed * enemy.direction;
      // Si un enemigo llega al borde del canvas, cambia la dirección y baja
      // if (enemy.colisionX + enemy.colisionWidth >= this.canvasElement.nativeElement.width || enemy.colisionX <= 0) {
      //   this.enemies.forEach(enemy => {
      //     enemy.speed *= direction;
      //     enemy.y += 20;
      //     enemy.colisionY += 20;
      //   });
      // }

      // Si un enemigo llega al borde del canvas, cambia la dirección y baja
      if (enemy.colisionX + enemy.colisionWidth > this.canvasElement.nativeElement.width) {
        this.enemies.forEach(enemy => {
          if(enemy.colisionX + enemy.colisionWidth > this.canvasElement.nativeElement.width){
            enemy.x = this.canvasElement.nativeElement.width - enemy.x;
            enemy.colisionWidth = this.canvasElement.nativeElement.width - enemy.colisionWidth;
          }
          enemy.direction *= -1;
          enemy.x += enemy.speed * enemy.direction;
          enemy.colisionX += enemy.speed * enemy.direction;
        });
      } 
      else if (enemy.colisionX <= 0) {
        this.enemies.forEach(enemy => {
          enemy.speed *= -1;
          enemy.y += 20;
          enemy.colisionY += 20;
        });
      }


    });
  }

  IsColliding(enemy: Enemy, bullet: Bullet): boolean {
    return (
      bullet.x < enemy.colisionX + enemy.colisionWidth &&
      bullet.x + bullet.width > enemy.colisionX &&
      bullet.y < enemy.colisionY + enemy.colisionHeight &&
      bullet.y + bullet.height > enemy.colisionY
    );
  }

  CreateFuertes(){
    const margin = 80;
    const lateralPadding = 80;
    const width = 110;

    for (let i = 0; i < 4; i++) {
      let x = lateralPadding + margin + width * i + margin * i;
      let y = 1000 - 225;

      if(i === 0) x = lateralPadding + margin;

      const fuerte: Fuerte = {
        width: 110,
        height: 80,
        x: x,
        y: y,
      }
      this.fuertes.push(fuerte);
    }
    console.log("Fuertes creados: ", this.fuertes);
  }
  DrawFuertes(){
    this.fuertes.forEach(fuerte => {
      this.ctx!.fillStyle = 'white';
      this.ctx!.fillRect(fuerte.x, fuerte.y, fuerte.width, fuerte.height);
    });
  }

  SpliceEnemies(spriteMap: HTMLImageElement): HTMLImageElement[] {
    const spriteWidth = 55;
    const spriteHeight = 55;
    const rows = 5;
    const cols = 7;
    const sprites: HTMLImageElement[] = [];
  
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = spriteWidth;
    tempCanvas.height = spriteHeight;
    const tempCtx = tempCanvas.getContext('2d');
  
    if (tempCtx) {
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          tempCtx.clearRect(0, 0, spriteWidth, spriteHeight);
          
          tempCtx.drawImage(
            spriteMap,
            col * spriteWidth,
            row * spriteHeight,
            spriteWidth,
            spriteHeight,
            0,
            0,
            spriteWidth,
            spriteHeight
          );
  
          const img = new Image();
          img.src = tempCanvas.toDataURL();
          sprites.push(img);
        }
      }
    }
  
    return sprites;
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
  maxSpeed: number;
  bulletSpeed: number;
  canShoot: boolean;
  shootDelay: number;
  sprites: any;
  colisionX: number;
  colisionY: number;
  colisionWidth: number;
  colisionHeight: number;
  frameIndex: number;
  animationTimer: number;
direction: number;
}
interface Fuerte{
x: number;
y: number;
width: number;
height: number;
}