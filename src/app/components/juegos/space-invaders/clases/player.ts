import { ElementRef, HostListener } from "@angular/core";
import { Bullet } from "../interfaces/bullet";
import { Enemy } from "../interfaces/enemy";
import { EnemyGroup } from "./enemy-group";
import { Fuertes } from "./fuertes";

export class Player {
    // Propiedades del jugador
    x: number = 0;
    y: number = 0;
    width: number = 40;
    height: number = 40;
    speed: number = 6;
    vidas: number = 3;

    // Propiedades de las balas
    canShoot: boolean = true;
    shotDelay: number = 500; // milliseconds
    bulletSpeed: number = 4;
    bullets: Bullet[] = [];
    bulletColor: string = "#BFF786"

    // Referencia al canvas y al contexto
    canvas: ElementRef<HTMLCanvasElement>;
    ctx: CanvasRenderingContext2D;

    // Controlador de las teclas
    controller = {
        left: {
            key: "ArrowLeft",
            state: false
        },
        right: {
            key: "ArrowRight",
            state: false
        },
        shoot: {
            key: " ",
            state: false,
        }
    }

    constructor(canvas: ElementRef<HTMLCanvasElement>, ctx: CanvasRenderingContext2D) {
        // Set the player in the middle of the canvas
        this.x = canvas.nativeElement.width / 2 - this.width / 2;
        this.y = canvas.nativeElement.height - this.height - 10;

        this.canvas = canvas;
        this.ctx = ctx;
    }

    Update(enemies: EnemyGroup, fuertes: Fuertes) {
        this.CheckInputs();
        this.ControlPlayer();
        this.CheckBulletsCollision(enemies, fuertes);
    }

    Draw() {
        this.ctx.fillStyle = this.bulletColor;
        this.ctx.fillRect(this.x, this.y, this.width, this.height);

        // Dibujar las balas
        this.bullets.forEach((bullet: Bullet, index: number) => {
            this.ctx!.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            bullet.y -= bullet.speed;
            if (bullet.y < 0) {
                this.bullets.splice(index, 1);
            }
        });
    }

    private ControlPlayer() {
        this.MoveLeft();
        this.MoveRight();
        this.Shoot();
    }

    private MoveLeft() {
        // Muévete a la izquierda si la tecla left está presionada
        if (this.controller.left.state) {
            // Valida la colisión con el borde izquierdo del canvas
            if (this.x > 0) {
                this.x -= this.speed;
            }
            else if (this.x < 0) {
                this.x = 0;
            }
        }

    }

    private MoveRight() {
        if (this.controller.right.state) {
            if (this.x + this.width < this.canvas.nativeElement.width) {
                this.x += this.speed;
            }
            else if (this.x + this.width > this.canvas.nativeElement.width) {
                this.x = this.canvas.nativeElement.width - this.width;
            }
        }
    }

    private Shoot() {
        if (this.controller.shoot.state && this.canShoot) {
            this.canShoot = false;

            const bullet: Bullet = {
                x: this.x + this.width / 2,
                y: this.y,
                width: 9,
                height: 20,
                speed: this.bulletSpeed,
            }
            this.bullets.push(bullet);

            setTimeout(() => {
                this.canShoot = true;
            }, this.shotDelay);
        }
    }

    private CheckInputs() {
        // Valida si se esta pulsando la tecla asignada
        // al controller.left con un addEventListener

        // Agregar el evento keydown
        addEventListener("keydown", (e) => {
            // Comprueba si se pulso la key asignada al controller.left
            if (e.key === this.controller.left.key) {
                this.controller.left.state = true;
            }

            // Comprueba si se pulso la key asignada al controller.right
            if (e.key === this.controller.right.key) {
                this.controller.right.state = true;
            }

            // Comprueba si se pulso la key asignada al controller.shoot
            if (e.key === this.controller.shoot.key) {
                this.controller.shoot.state = true;
            }
        });

        // Agregar el evento keyup
        addEventListener("keyup", (e) => {
            // Comprueba si se soltó la key asignada al controller.left
            if (e.key === this.controller.left.key) {
                this.controller.left.state = false;
            }

            // Comprueba si se soltó la key asignada al controller.right
            if (e.key === this.controller.right.key) {
                this.controller.right.state = false;
            }

            // Comprueba si se soltó la key asignada al controller.shoot
            if (e.key === this.controller.shoot.key) {
                this.controller.shoot.state = false;
            }
        });

    }

    CheckBulletsCollision(enemies: EnemyGroup, fuertes: Fuertes) {
        // Recorre las balas del jugador
        for (const bullet of this.bullets) {
            // Comprueba la colision contra los enemigos
            let colision = false;
            for (let i = 0; i < enemies.enemies.length; i++) {
                if (bullet.y <= enemies.enemies[i].colisionY + enemies.enemies[i].colisionHeight &&
                    bullet.y + bullet.height >= enemies.enemies[i].colisionY &&
                    bullet.x + bullet.width >= enemies.enemies[i].colisionX &&
                    bullet.x <= enemies.enemies[i].colisionX + enemies.enemies[i].colisionWidth) {
                    enemies.enemies.splice(i, 1);
                    this.bullets.splice(this.bullets.indexOf(bullet), 1);
                    colision = true;
                    break;
                }
            }
            if (colision) continue;
            // Comprueba la colision contra los fuertes
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
                                        this.bullets.splice(this.bullets.indexOf(bullet), 1);
                                        fuertes.fuertes[i].chuncks[y][x]--;
                                        break;
                                    }
                                }
                            }
                        }

                    }
                }
            }
        }

    }

    RecibirDisparo(){
        if(this.vidas = 0){
            console.log("Has perdido");
            return;
        }
        console.log("Recibiste un disparo");
        console.log("-1 vida");
        this.vidas--;
        console.log("Vidas restantes: ", this.vidas);

    }

}

