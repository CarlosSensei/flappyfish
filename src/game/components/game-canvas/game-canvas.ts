import { AfterViewInit, Component, ElementRef, ViewChild, HostListener, OnDestroy } from '@angular/core';
import { GameEngineService } from '../../services/game-engine';

@Component({
    selector: 'app-game-canvas',
    standalone: true,
    templateUrl: './game-canvas.html',
    styleUrl: './game-canvas.css'
})
export class GameCanvasComponent implements AfterViewInit, OnDestroy {

    @ViewChild('canvas')
    canvasRef!: ElementRef<HTMLCanvasElement>;

    private canvas!: HTMLCanvasElement;
    private ctx!: CanvasRenderingContext2D;

    private animationId = 0;

    private fishImg = new Image();
    private coralTopImg = new Image();
    private coralBottomImg = new Image();
    private backgroundImg = new Image();

    constructor(public engine: GameEngineService) {}

    ngAfterViewInit(): void {

        this.canvas = this.canvasRef.nativeElement;
        this.resizeCanvas();
        const context = this.canvas.getContext('2d');

        this.fishImg.src = 'assets/fish/shark1.webp';
        this.coralTopImg.src = 'assets/coral/coral.webp';
        this.coralBottomImg.src = 'assets/coral/coral1.png';
        this.backgroundImg.src = 'assets/background/bg1.jpg';

        if (!context) {

            throw new Error('Canvas context not available');
        }

        this.ctx = context;
        this.gameLoop();
    }

    ngOnDestroy(): void {
        cancelAnimationFrame(this.animationId);
    }

    gameLoop(): void {

        this.engine.updatePhysics(this.canvas.height);
        this.engine.updateCorales(this.canvas.width, this.canvas.height);
        this.engine.updateScore();

        this.engine.checkCollisions(this.canvas.height);
        this.draw();

        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }

    draw(): void {

        this.ctx.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        this.updateBubbles();

        this.drawBackground();

        this.drawBackBubbles();

        this.drawCorals();

        this.drawFish();

        this.drawFrontBubbles();
    }

    private drawBackground(): void {

        if (this.backgroundImg.complete && this.backgroundImg.naturalWidth > 0) {

            this.ctx.drawImage(this.backgroundImg, 0, 0, 
                this.canvas.width, this.canvas.height);

        } else {

            this.ctx.fillStyle = '#0b3050';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    impulso(): void {

        if (this.engine.terminado()) {
            this.engine.reiniciar();
            return;
        }

        this.engine.jugando.set(true);
        this.engine.pez.vy = this.engine.IMPULSO;
    }

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent): void {

        if (event.code === 'Space') {
            event.preventDefault();
            this.impulso();
        }
    }

    @HostListener('window:resize')
    onResize(): void {
        this.resizeCanvas();
    }

    private resizeCanvas(): void {

        if (!this.canvas) {
            return;
        }

        this.canvas.width = Math.min(window.innerWidth * 0.9, 1000);
        this.canvas.height = window.innerHeight * 0.85;
    }

    // Dibuja los corales
    private drawCorals(): void {

        this.engine.corales.forEach(coral => {

            const topHeight = coral.centro - this.engine.huecoActual / 2;
            const bottomY = coral.centro + this.engine.huecoActual / 2;
            const bottomHeight = this.canvas.height - bottomY;

            // GLOW

            this.ctx.save();

            this.ctx.shadowColor = '#ff6fb5';
            this.ctx.shadowBlur = 15;

            // CORAL SUPERIOR

            this.ctx.fillStyle = '#ff6fb53b';
            this.ctx.fillRect(coral.x, 0, this.engine.ANCHO_CORAL, topHeight);

            // CORAL INFERIOR

            this.ctx.fillRect(coral.x, bottomY, this.engine.ANCHO_CORAL, bottomHeight);
            this.ctx.restore();

            // BRILLO SUPERIOR

            this.ctx.fillStyle = 'rgba(255,255,255,.15)';
            this.ctx.fillRect(coral.x + 4, 0, 6, topHeight);

            // BRILLO INFERIOR

            this.ctx.fillRect(coral.x + 4, bottomY, 6, bottomHeight);

            // IMAGEN SUPERIOR

            if (this.coralTopImg.complete && this.coralTopImg.naturalWidth > 0) {

                this.ctx.drawImage(this.coralTopImg, coral.x, 0,
                    this.engine.ANCHO_CORAL, topHeight);
            }

            // IMAGEN INFERIOR

            if (this.coralBottomImg.complete && this.coralBottomImg.naturalWidth > 0) {

                this.ctx.drawImage(this.coralBottomImg, coral.x,
                    bottomY, this.engine.ANCHO_CORAL, bottomHeight);
            }

        });
    }

    // Dibuja el shark
    private drawFish(): void {

        const size = 120;

        this.ctx.save();

        this.ctx.translate(this.engine.pez.x, this.engine.pez.y);
        this.ctx.rotate(this.engine.rotacionPez);

        this.ctx.shadowColor = '#00c3ff';
        this.ctx.shadowBlur = 20;

        this.ctx.drawImage(this.fishImg, -size / 2, -size / 2, size, size);
        this.ctx.shadowBlur = 0;

        this.ctx.restore();
    }

    // Burbujas del fondo
    private backBubbles = Array.from(
        { length: 20 },
        () => this.createBubble()
    );

    private frontBubbles = Array.from(
        { length: 12 },
        () => this.createBubble(true)
    );

    private createBubble(front = false) {

        return {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,

            size: front
                ? 8 + Math.random() * 14
                : 4 + Math.random() * 8,

            speed: front
                ? 1.5 + Math.random() * 1.5
                : 0.3 + Math.random() * 0.8,

            opacity: front
                ? 0.4 + Math.random() * 0.3
                : 0.1 + Math.random() * 0.2
        };
    }

    private updateBubbles(): void {

        [...this.backBubbles, ...this.frontBubbles]
            .forEach(bubble => {

                bubble.y -= bubble.speed;

                if (bubble.y < -30) {

                    bubble.y =
                        this.canvas.height + 30;

                    bubble.x =
                        Math.random() *
                        this.canvas.width;
                }
            });
    }

    private drawBackBubbles(): void {

        this.backBubbles.forEach(bubble => {

            this.ctx.globalAlpha =
                bubble.opacity;

            this.ctx.fillStyle =
                '#bfe9ff';

            this.ctx.beginPath();

            this.ctx.arc(
                bubble.x,
                bubble.y,
                bubble.size,
                0,
                Math.PI * 2
            );

            this.ctx.fill();
        });

        this.ctx.globalAlpha = 1;
    }

    private drawFrontBubbles(): void {

        this.frontBubbles.forEach(bubble => {

            this.ctx.globalAlpha =
                bubble.opacity;

            this.ctx.fillStyle =
                '#dff7ff';

            this.ctx.beginPath();

            this.ctx.arc(
                bubble.x,
                bubble.y,
                bubble.size,
                0,
                Math.PI * 2
            );

            this.ctx.fill();

            // brillo interno

            this.ctx.fillStyle =
                'rgba(255,255,255,.4)';

            this.ctx.beginPath();

            this.ctx.arc(
                bubble.x - bubble.size / 4,
                bubble.y - bubble.size / 4,
                bubble.size / 4,
                0,
                Math.PI * 2
            );

            this.ctx.fill();
        });

        this.ctx.globalAlpha = 1;
    }


}