import { ElementRef } from "@angular/core";
import { Fuerte } from "../interfaces/fuerte";

export class Fuertes {

    fuertes: Fuerte[] = [];
    canvas: ElementRef<HTMLCanvasElement>;
    ctx: CanvasRenderingContext2D;

    constructor(canvas: ElementRef<HTMLCanvasElement>, ctx: CanvasRenderingContext2D) {
        this.canvas = canvas;
        this.ctx = ctx;

        this.GenerarFuertes();
    }

    Update() {
        // TODO: Comprobar colision con las balas del jugador
    }

    Draw() {
        this.fuertes.forEach(fuerte => {
            fuerte.chuncks.forEach((row, rowIndex) => {
                row.forEach((value, colIndex) => {
                    if (value === 1) {
                        const x = fuerte.x + colIndex * fuerte.chunckWidth;
                        const y = fuerte.y + rowIndex * fuerte.chunckHeight;
                        this.ctx!.fillStyle = 'white';
                        this.ctx!.fillRect(x, y, fuerte.chunckWidth, fuerte.chunckHeight);
                    }
                });
            });
        });
    }

    GenerarFuertes() {
        const margin = 80;
        const lateralPadding = 80;
        const width = 110;

        for (let i = 0; i < 4; i++) {
            let x = lateralPadding + margin + width * i + margin * i;
            let y = 1000 - 225;

            if (i === 0) x = lateralPadding + margin;

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
                chunckWidth: 110 / 3,
                chunckHeight: 80 / 3,
            }
            this.fuertes.push(fuerte);
        }
        console.log("Fuertes creados: ", this.fuertes);
    }
}
