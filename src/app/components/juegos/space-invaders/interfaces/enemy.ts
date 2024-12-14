export interface Enemy {
    x: number,
    y: number,
    width: number;
    height: number;

    colisionX: number;
    colisionY: number;
    colisionWidth: number;
    colisionHeight: number;


    speed: number;
    maxSpeed: number;

    bulletSpeed: number;
    canShoot: boolean;

    speedList: number[];
    sprites: any;

    frameIndex: number;
    animationTimer: number;
}
