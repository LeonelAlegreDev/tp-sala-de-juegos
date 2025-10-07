import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  signal,
  computed,
  HostListener,
  AfterViewInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { MenuComponent } from '../../menu/menu.component';
import { CommonModule } from '@angular/common';

interface SnakeSegment {
  x: number;
  y: number;
}

interface FoodPosition {
  x: number;
  y: number;
}

type Direction = 'up' | 'down' | 'left' | 'right';

@Component({
  selector: 'app-snake', // Selector actualizado
  standalone: true,
  templateUrl: './snake.component.html',
  styleUrls: ['./snake.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MenuComponent, CommonModule]
})
export class SnakeComponent implements AfterViewInit { // Nombre de la clase actualizado
  @ViewChild('snakeCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;

  // --- Game Constants ---
  readonly canvasSize = 500;
  readonly cellSize = 20;
  readonly FPS = 70;
  readonly gameSpeed = 10000 / this.FPS;

  // --- Game State (Signals) ---
  score = signal(0);
  snake = signal<SnakeSegment[]>([]);
  food = signal<FoodPosition>({ x: 0, y: 0 });
  direction = signal<Direction>('right');
  directionQueue = signal<Direction>('right');
  isGameOver = signal(true);
  isPlaying = computed(() => !this.isGameOver());
  gameStates = ['start', 'playing', 'gameover'];
  gameState = this.gameStates[0];

  private gameLoopRef: any;
  private possibleCoordinates: number[] = [];
  private playing: boolean = false;

  constructor() {
    // Calculate all possible X/Y coordinates based on cellSize
    for (let i = 0; i < this.canvasSize; i += this.cellSize) {
      this.possibleCoordinates.push(i);
    }
  }

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;

    // Focus canvas for desktop key events
    canvas.focus();
  }

  // --- Input Handling ---
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    const keycode = event.keyCode;
    this.processDirectionChange(keycode);
  }

  processDirectionChange(keycode: number | Direction): void {
    let newDirectionQueue: Direction | null = null;
    const currentDirection = this.direction();

    if (typeof keycode === 'string') {
        newDirectionQueue = keycode;
    } else {
        // Keyboard keycodes
        if (keycode === 37 && currentDirection !== 'right') { // Left Arrow
            newDirectionQueue = 'left';
        } else if (keycode === 38 && currentDirection !== 'down') { // Up Arrow
            newDirectionQueue = 'up';
        } else if (keycode === 39 && currentDirection !== 'left') { // Right Arrow
            newDirectionQueue = 'right';
        } else if (keycode === 40 && currentDirection !== 'up') { // Down Arrow (original code had 'top', fixed to 'up')
            newDirectionQueue = 'down';
        }
    }

    if (newDirectionQueue) {
      this.directionQueue.set(newDirectionQueue);
    }
  }

  changeDirection(dir: Direction) {
    this.processDirectionChange(dir);
  }

  // --- Drawing Functions ---

  drawSquare(x: number, y: number, color: string): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
  }

  setBackground(color1: string = '#fff', color2: string = '#eee'): void {
    this.ctx.fillStyle = color1;
    this.ctx.strokeStyle = color2;

    this.ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);

    // Draw grid lines (optional, kept for original feel but slightly simplified)
    this.ctx.beginPath();
    for (let x = 0.5; x < this.canvasSize; x += this.cellSize) {
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvasSize);
    }
    for (let y = 0.5; y < this.canvasSize; y += this.cellSize) {
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvasSize, y);
    }
    this.ctx.stroke();
    this.ctx.closePath();
  }

  drawSnake(): void {
    // Red segment for the head
    const head = this.snake()[0];
    if (head) {
        this.drawSquare(head.x, head.y, '#3498db');
    }
    // Blue segments for the body
    for (let i = 1; i < this.snake().length; i++) {
        const segment = this.snake()[i];
        this.drawSquare(segment.x, segment.y, '#5dade2');
    }
  }

  drawFood(): void {
    const currentFood = this.food();
    this.drawSquare(currentFood.x, currentFood.y, '#ff3636');
  }

  start(){
    this.gameState = this.gameStates[1];  // playing
  }

  startGame(): void {
    this.gameState = 'playing';
    this.newGame();
  }


  newGame(): void {
    if (this.gameLoopRef) {
      clearInterval(this.gameLoopRef);
    }

    this.isGameOver.set(false);
    this.score.set(0);
    this.direction.set('right');
    this.directionQueue.set('right');
    this.createSnake();
    this.createFood();

    this.gameState = 'playing';

    this.gameLoopRef = setInterval(() => this.game(), this.gameSpeed);
  }

  createSnake(): void {
    const newSnake: SnakeSegment[] = [];
    const snakeLength = 5;
    for (let i = snakeLength - 1; i >= 0; i--) {
      const x = i * this.cellSize;
      newSnake.push({ x: x, y: 0 });
    }
    this.snake.set(newSnake);
  }

  createFood(): void {
    let newFood: FoodPosition;
    let collision: boolean;

    do {
      // Pick random coordinates from the pre-calculated array
      newFood = {
        x: this.possibleCoordinates[Math.floor(Math.random() * this.possibleCoordinates.length)],
        y: this.possibleCoordinates[Math.floor(Math.random() * this.possibleCoordinates.length)],
      };
      
      collision = false;
      // Check collision with the snake body
      for (const segment of this.snake()) {
        if (this.checkCollision(newFood.x, newFood.y, segment.x, segment.y)) {
          collision = true;
          break;
        }
      }
    } while (collision);

    this.food.set(newFood);
  }

  checkCollision(x1: number, y1: number, x2: number, y2: number): boolean {
    return x1 === x2 && y1 === y2;
  }

  moveSnake(): void {
    this.direction.set(this.directionQueue()); // Set current direction from queue

    const currentSnake = this.snake();
    const head = currentSnake[0];
    let newX = head.x;
    let newY = head.y;

    // Calculate new head position
    switch (this.direction()) {
      case 'right': newX += this.cellSize; break;
      case 'left': newX -= this.cellSize; break;
      case 'up': newY -= this.cellSize; break;
      case 'down': newY += this.cellSize; break;
    }

    // Move logic: remove tail and place it at the new head position
    const newHead = { x: newX, y: newY };
    
    // Create new snake array with the new head and the existing body (minus the old tail)
    this.snake.update(s => [newHead, ...s.slice(0, s.length - 1)]);
  }

  gameOver(): void {
    if (this.gameLoopRef) {
      clearInterval(this.gameLoopRef); // Detener el bucle inmediatamente
    }
    this.gameState = 'gameover'; // Cambiar el estado del juego
  }

  // --- Main Game Loop ---
  game(): void {
    if (this.isGameOver()) this.gameOver();

    this.moveSnake();

    const head = this.snake()[0];

    // 1. Check for Wall Collisions
    const wallCollision = head.x < 0 || head.x >= this.canvasSize || head.y < 0 || head.y >= this.canvasSize;
    
    // 2. Check for Self Collision
    let selfCollision = false;
    for (let i = 1; i < this.snake().length; i++) {
      if (this.checkCollision(head.x, head.y, this.snake()[i].x, this.snake()[i].y)) {
        selfCollision = true;
        break;
      }
    }

    if (wallCollision || selfCollision) {
      this.isGameOver.set(true); // Asegurarse de actualizar el estado inmediatamente
      this.gameOver(); // Detener el bucle y cambiar el estado del juego
      return;
    }

    // 3. Check for Food Collision
    const currentFood = this.food();
    if (this.checkCollision(head.x, head.y, currentFood.x, currentFood.y)) {
      
      // Grow the snake (by not removing the tail on the last move)
      this.snake.update(s => [...s, { x: head.x, y: head.y }]); // Add a dummy segment (it will be correctly positioned on the next move)
      
      this.score.update(s => s + 10);
      this.createFood(); // Generate new food
    }

    // 4. Drawing (Render the frame)
    this.setBackground('#0f172a', '#1e293b'); // Dark background
    this.drawFood();
    this.drawSnake();
  }

  resetGame(): void {
    this.gameState = 'start';
    this.isGameOver.set(true);
    this.score.set(0);
    this.snake.set([]);
    this.food.set({ x: 0, y: 0 });
    this.direction.set('right');
    this.directionQueue.set('right');
  }
}
