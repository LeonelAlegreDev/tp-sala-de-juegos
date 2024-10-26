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
    puntos: 0,
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
    shotDelay: 100, // ms
    canShoot: true,
    bulletSpeed: 4,
    bullets: [] as Bullet[],
    vidas: 3,
  };
  private enemies: Enemy[] = [];
  private enemiesBullets: Bullet[] = [];
  private fuertes: Fuerte[] = [];
  private spriteMap: HTMLImageElement;
  private enemyMovementCoordinator = {
    goRight: true,
    goLeft: false,
    goDown: false,
  }
  private lastShootTimeEnemy: number = 0;

  constructor() { 
    this.spriteMap = new Image();
    this.spriteMap.src = '../../../../assets/images/space-invaders/space-invaders2.png';
  }

  Start(){
    this.gameState = this.gameStateList[1]; // playing
    this.run = {
      puntos: 0,
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
          sprites: frames,
          colisionWidth: colisionWidth,
          colisionHeight: colisionHeight,
          colisionX: colisionX,
          colisionY: colisionY,
          frameIndex: 0,
          animationTimer: 0,
          speedList: [1, 1.8, 2.5, 3.5, 5]
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
    this.enemiesBullets.forEach((bullet: Bullet, index: number) => {
      this.ctx!.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
  }

  UpdateEnemies(): void {
    // Acumula tiempo para el disparo de los enemigos
    this.lastShootTimeEnemy += this.deltaTime;
    // Cada 2 segundos un enemigo aleatorio dispara
    if (this.lastShootTimeEnemy >= 1000 && this.enemies.length > 0) {
      const randomIndex = Math.floor(Math.random() * this.enemies.length);
      // this.enemies[randomIndex].canShoot = true;
      // this.DispararEnemigo(this.enemies[randomIndex]); 
      // this.enemies[17].canShoot = true;
      // this.DispararEnemigo(this.enemies[17]); 
      this.enemies[11].canShoot = true;
      this.DispararEnemigo(this.enemies[11]); 
      // this.enemies[14].canShoot = true;
      // this.DispararEnemigo(this.enemies[14]); 
      // CHANGE

      this.lastShootTimeEnemy = 0;
    }

    // Actauliza el estado de los enemigos
    for(let i = 0; i < this.enemies.length; i++){
      let bulletCollision = false;
      // Comprueba la colision con las balas del jugador
      for(let j = 0; j < this.player.bullets.length; j++){
        // Valida si la bala colisiona con un enemigo
        if(this.IsColliding(this.enemies[i], this.player.bullets[j])){
          // Eliminar la bala y el enemigo
          this.player.bullets.splice(j, 1);
          this.enemies.splice(i, 1);
          // Incrementar puntos o cualquier otra lógica de juego
          this.run.puntos += 10;
          bulletCollision = true;
          break;
        }
      }
      if(bulletCollision) continue;

      this.enemies[i].speed = 0;
      // Aumenta la velocidad de los enemigos segun la cantidad de enemigos restantes
      if(this.enemies.length <= 40 && this.enemies.length > 30){
        this.enemies[i].speed = this.enemies[1].speedList[1];
      }
      else if(this.enemies.length <= 30 && this.enemies.length > 20){
        this.enemies[i].speed = this.enemies[1].speedList[2];
      }
      else if(this.enemies.length <= 20 && this.enemies.length > 1){
        this.enemies[i].speed = this.enemies[1].speedList[3];
      }
      if(this.enemies.length === 1) {
        this.enemies[i].speed = this.enemies[i].speedList[4];
      }

      // Mueve el enemigo hacia abajo
      if(this.enemyMovementCoordinator.goDown){
        this.enemies[i].y += 10;
        this.enemies[i].colisionY += 10;
      }
      // Cancela el movimiento hacia abajo si es el ultimo enemigo
      if(i === this.enemies.length - 1){
        this.enemyMovementCoordinator.goDown = false;
      }
      // Mueve el enemigo hacia la derecha
      if(this.enemyMovementCoordinator.goRight){
        this.enemies[i].x += this.enemies[i].speed;
        this.enemies[i].colisionX += this.enemies[i].speed;
      }
      // Mueve el enemigo hacia la izquierda
      if(this.enemyMovementCoordinator.goLeft){
        this.enemies[i].x -= this.enemies[i].speed;
        this.enemies[i].colisionX -= this.enemies[i].speed;
      }
      // Cambia los estados del coordinador de movimiento segun la colision
      if(this.isCollidingRight(this.enemies[i])){
        this.enemyMovementCoordinator.goLeft = true;
        this.enemyMovementCoordinator.goRight = false;
        this.enemyMovementCoordinator.goDown = true;
        break;
      }
      if(this.isCollidingLeft(this.enemies[i])){
        this.enemyMovementCoordinator.goLeft = false;
        this.enemyMovementCoordinator.goRight = true;
        this.enemyMovementCoordinator.goDown = true;
        break;
      }
    }

    // Actualiza el estado de las balas de los enemigos
    for(let i = 0; i < this.enemiesBullets.length; i++){
      // Muve la bala hacia abajo
      this.enemiesBullets[i].y += this.enemiesBullets[i].speed;

      // Comprueba si la bala sale del canvas
      if(this.enemiesBullets[i].y > this.canvasElement.nativeElement.height){
        this.enemiesBullets.splice(i, 1);
      }
      // Comprueba si la bala colisiona con el jugador
      else if(this.enemiesBullets[i].y + this.enemiesBullets[i].height >= this.player.y &&
              this.enemiesBullets[i].y <= this.player.y + this.player.height &&
              this.enemiesBullets[i].x >= this.player.x && 
              this.enemiesBullets[i].x <= this.player.x + this.player.width)
      {
        this.enemiesBullets.splice(i, 1);
        this.player.vidas--;
      }
      
      if(!this.enemiesBullets[i]) break;

      // Compruba si la bala colisiona con un fuerte
      let deleteBullet = this.DetectarColisionFuerte(this.enemiesBullets[i]);

      if(deleteBullet){
        this.enemiesBullets.splice(i, 1);
      }
    }
  }

  isCollidingRight(enemy: Enemy){
    return enemy.colisionX + enemy.colisionWidth >= this.canvasElement.nativeElement.width;
  }
  isCollidingLeft(enemy: Enemy){
    return enemy.colisionX <= 0;
  }
  DispararEnemigo(enemy: Enemy){
    const bullet: Bullet = {
      x: enemy.x + enemy.width / 2,
      y: enemy.y + enemy.height,
      width: 9,
      height: 20,
      speed: enemy.bulletSpeed,
    }
    if(enemy.canShoot){
      this.enemiesBullets.push(bullet);
      enemy.canShoot = false;
    }
    else console.log("No puede disparar");
  }

  IsColliding(enemy: Enemy, bullet: Bullet): boolean {
    return (
      bullet.x < enemy.colisionX + enemy.colisionWidth &&
      bullet.x + bullet.width > enemy.colisionX &&
      bullet.y < enemy.colisionY + enemy.colisionHeight &&
      bullet.y + bullet.height > enemy.colisionY
    );
  }

  DetectarColisionFuerte(bullet: Bullet) :boolean{
    let isColliding = false;

    for(let i = 0; i < this.fuertes.length; i++){
      // Determina si esta en el rango de Y
      if(bullet.y + bullet.height >= this.fuertes[i].y &&
         bullet.y <= this.fuertes[i].y + this.fuertes[i].height)
      {
        // Determina si esta en el rango de X
        if((bullet.x >= this.fuertes[i].x || bullet.x + bullet.width >= this.fuertes[i].x) && 
            bullet.x <= this.fuertes[i].x + this.fuertes[i].width)
        {
          // Calcula si colisiona con 2 chunks al mismo tiempo, o si colisiona con un solo chunk 
          let chunkXLeft = (bullet.x - this.fuertes[i].x) / this.fuertes[i].chunckWidt;
          let chunkXRight = (bullet.x + bullet.width - this.fuertes[i].x) / this.fuertes[i].chunckWidt;
          console.log("ChunkLeft: ", chunkXLeft);
          console.log("ChunkRight: ", chunkXRight);

          let roundedChunkXLeft = Math.floor(chunkXLeft);
          let roundedChunkXRight = Math.floor(chunkXRight);
          console.log("RoundedChunkLeft: ", roundedChunkXLeft);
          console.log("RoundedChunkRight: ", roundedChunkXRight);
          
          if(roundedChunkXLeft === roundedChunkXRight)
          {
            console.log("Un solo chunk colisiona");
            this.fuertes[i].chuncks[Math.floor(bullet.y / this.fuertes[i].chunckHeight)][roundedChunkXLeft] = 0;
            isColliding = true;
            break;
          }
          else
          {
            console.log("El chunk esta en el borde de un chunk");
            this.fuertes[i].chuncks[Math.floor(bullet.y / this.fuertes[i].chunckHeight)][roundedChunkXLeft] = 0;
            this.fuertes[i].chuncks[Math.floor(bullet.y / this.fuertes[i].chunckHeight)][roundedChunkXRight] = 0;
            isColliding = true;
            break
          }
        }
      }
    }

    return isColliding;
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
        chuncks: [
          [1, 1, 1],
          [1, 1, 1],
          [1, 0, 1]
        ],
        chunckWidt: 110 / 3,
        chunckHeight: 80 / 3,
      }
      this.fuertes.push(fuerte);
    }
    console.log("Fuertes creados: ", this.fuertes);
  }
  DrawFuertes(){
    // this.fuertes.forEach(fuerte => {
    //   this.ctx!.fillStyle = 'white';
    //   this.ctx!.fillRect(fuerte.x, fuerte.y, fuerte.width, fuerte.height);
    // });
    this.fuertes.forEach(fuerte => {
      fuerte.chuncks.forEach((row, rowIndex) => {
        row.forEach((value, colIndex) => {
          if (value === 1) {
            const x = fuerte.x + colIndex * fuerte.chunckWidt;
            const y = fuerte.y + rowIndex * fuerte.chunckHeight;
            this.ctx!.fillStyle = 'white';
            this.ctx!.fillRect(x, y, fuerte.chunckWidt, fuerte.chunckHeight);
          }
        });
      });
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
  speedList: number[];
  canShoot: boolean;
  sprites: any;
  colisionX: number;
  colisionY: number;
  colisionWidth: number;
  colisionHeight: number;
  frameIndex: number;
  animationTimer: number;

}
interface Fuerte{
x: number;
y: number;
width: number;
height: number;
chuncks: number[][];
chunckWidt: number;
chunckHeight: number;
}