import { ElementRef } from "@angular/core";
import { Enemy } from "../interfaces/enemy";
import { Bullet } from "../interfaces/bullet";
import { Player } from "./player";
import { Fuertes } from "./fuertes";

export class EnemyGroup {
    // Referencia al canvas y al contexto
    canvas: ElementRef<HTMLCanvasElement>;
    ctx: CanvasRenderingContext2D;

    enemies: Enemy[] = [];
    enemyBullets: Bullet[] = [];
    private lastShootTimeEnemy: number = 0;
    private spriteMap: HTMLImageElement;
    private enemyMovementCoordinator = {
        goDown: false,
        direction: 'right',
    }

    constructor(canvas: ElementRef<HTMLCanvasElement>, ctx: CanvasRenderingContext2D) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.spriteMap = new Image();
        this.spriteMap.src = '../../../../assets/images/space-invaders/space-invaders2.png';

        this.CreateEnemies();
    }

    Update(deltaTime: number, player: Player, fuertes: Fuertes) {
        this.DispararEnemigoAleatorio(deltaTime);
        this.Move();
        this.CheckBulletsCollition(player, fuertes);
    }

    Move() {
        // Mueve a las balas

        for(const bullet of this.enemyBullets) {
            bullet.y += bullet.speed;
        }

        for(const enemy of this.enemies){
            if(this.IsCollidingRight(enemy)){
                this.enemyMovementCoordinator.direction = 'left';
                this.enemyMovementCoordinator.goDown = true;
            }
            if(this.IsCollidingLeft(enemy)){
                this.enemyMovementCoordinator.direction = 'right';
                this.enemyMovementCoordinator.goDown = true;
            }
        }
        if(this.enemies.length === 1){
            this.enemies[0].speed = this.enemies[0].maxSpeed;
        }

        // Mueve a los enemigos
        this.MoveEnemies(this.enemyMovementCoordinator.direction);

    }

    MoveEnemies(direction: string){
        for(const enemy of this.enemies){
            switch(direction){
                case 'right':
                    enemy.x += enemy.speed;
                    enemy.colisionX += enemy.speed;
                    break;

                case 'left':
                    enemy.x -= enemy.speed;
                    enemy.colisionX -= enemy.speed;
                    break;
            }
            if(this.enemyMovementCoordinator.goDown){
                enemy.y += 20;
                enemy.colisionY += 20;
                if(enemy.speed < enemy.maxSpeed){
                    enemy.speed += 0.1;
                }
                
            }
        }
        this.enemyMovementCoordinator.goDown = false;
    }

    IsCollidingRight(enemy: Enemy): boolean{
        if(enemy.colisionX + enemy.colisionWidth >= this.canvas.nativeElement.width){
            return true;
        }
        return false;
    }
    IsCollidingLeft(enemy: Enemy): boolean{
        if(enemy.colisionX <= 0){
            return true;
        }
        return false;
    }

    Draw(deltaTime: number) {
        this.enemies.forEach(enemy => {
            const sprite = enemy.sprites[enemy.frameIndex];
            this.ctx!.drawImage(sprite, enemy.x, enemy.y);

            this.ctx!.beginPath();
            this.ctx!.rect(enemy.colisionX, enemy.colisionY, enemy.colisionWidth, enemy.colisionHeight);
            this.ctx!.strokeStyle = 'red';
            this.ctx!.stroke();

            // Actualizar el temporizador de animación
            enemy.animationTimer += deltaTime;
            if (enemy.animationTimer >= 500) { // 500 ms = 0.5 segundos
                enemy.frameIndex = (enemy.frameIndex + 1) % enemy.sprites.length;
                enemy.animationTimer = 0;
            }
        });
        this.enemyBullets.forEach((bullet: Bullet, index: number) => {
            this.ctx.fillStyle = "#F75C61";
            this.ctx!.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
    }


    DispararEnemigoAleatorio(deltaTime: number) {
        // Acumula tiempo para el disparo de los enemigos
        this.lastShootTimeEnemy += deltaTime;

        // Cada 2 segundos un enemigo aleatorio dispara
        if (this.lastShootTimeEnemy >= 1000 && this.enemies.length > 0) {
            // Selecciona un indice aleatorio de la lista de enemigos
            const randomIndex = Math.floor(Math.random() * this.enemies.length);
            // Habilita el disparo del enemigo seleccionado y dispara
            this.enemies[randomIndex].canShoot = true;
            this.DispararEnemigo(this.enemies[randomIndex]);
            // Reinicia el temporizador
            this.lastShootTimeEnemy = 0;
        }
    }
    CheckBulletsCollition(player: Player, fuertes: Fuertes) {
        for (const bullet of this.enemyBullets) {
            if(this.IsCollidingFuerte(bullet, fuertes)) continue;

            // Comprueba la colision de las balas de los enemigos con el jugador
            if (bullet.x < player.x + player.width &&
                bullet.x + bullet.width > player.x &&
                bullet.y < player.y + player.height &&
                bullet.y + bullet.height > player.y) {
                this.enemyBullets.splice(this.enemyBullets.indexOf(bullet), 1);
                player.RecibirDisparo();
            }
        }
    }

    IsCollidingFuerte(bullet: Bullet, fuertes: Fuertes): boolean {
        // Comprueba la colision de las balas de los enemigos con los fuertes
        for (let i = 0; i < fuertes.fuertes.length; i++) {
            // Si la bala esta entre el Eje Y del fuerte
            if (bullet.y <= fuertes.fuertes[i].y + fuertes.fuertes[i].height &&
                bullet.y + bullet.height >= fuertes.fuertes[i].y) {
                // Si la bala esta entre el Eje X del fuerte
                if (bullet.x + bullet.width >= fuertes.fuertes[i].x &&
                    bullet.x <= fuertes.fuertes[i].x + fuertes.fuertes[i].width) {
                    for (let y = 0; y < fuertes.fuertes[i].chuncks.length; y++) {
                        for (let x = 0; x < fuertes.fuertes[i].chuncks[y].length; x++) {
                            if (fuertes.fuertes[i].chuncks[y][x] === 1) {
                                if (bullet.x <= fuertes.fuertes[i].x + x * fuertes.fuertes[i].chunckWidth + fuertes.fuertes[i].chunckWidth &&
                                    bullet.x + bullet.width >= fuertes.fuertes[i].x + x * fuertes.fuertes[i].chunckWidth &&
                                    bullet.y <= fuertes.fuertes[i].y + y * fuertes.fuertes[i].chunckHeight + fuertes.fuertes[i].chunckHeight &&
                                    bullet.y + bullet.height >= fuertes.fuertes[i].y + y * fuertes.fuertes[i].chunckHeight) {
                                    this.enemyBullets.splice(this.enemyBullets.indexOf(bullet), 1);
                                    fuertes.fuertes[i].chuncks[y][x]--;
                                    return true;
                                }
                            }
                        }
                    }

                }
            }
        }
        return false;
    }

    CreateEnemies() {
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

                switch (row) {
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

                if (col === 0) x = lateralPadding;

                const enemy: Enemy = {
                    x: x,
                    y: y,
                    width: width,
                    height: height,
                    speed: 0.7,
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

    DispararEnemigo(enemy: Enemy) {
        const bullet: Bullet = {
            x: enemy.x + enemy.width / 2,
            y: enemy.y + enemy.height,
            width: 9,
            height: 20,
            speed: enemy.bulletSpeed,
        }
        if (enemy.canShoot) {
            this.enemyBullets.push(bullet);
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
}
