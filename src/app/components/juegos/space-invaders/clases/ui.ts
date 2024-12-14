import { ElementRef } from "@angular/core";

export class UI {


    constructor(private canvas: ElementRef<HTMLCanvasElement>, private ctx: CanvasRenderingContext2D) {
        this.canvas = canvas;
        this.ctx = ctx;
    }


    Draw(fps: number){
        this.ctx.font = "20px Arial";
        this.ctx.fillStyle = "white";
        this.ctx.fillText(`FPS: ${Math.round(fps)}`, 10, 20);
    }
}
