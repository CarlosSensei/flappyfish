import { Injectable, signal } from '@angular/core';
import { Fish } from '../models/fish.model';
import { Coral } from '../models/coral.model';

@Injectable({
    providedIn: 'root'
})
export class GameEngineService {

    readonly GRAVEDAD = 0.45;
    readonly IMPULSO = -7.5;
    readonly ANCHO_CORAL = 58;

    pez: Fish;
    corales: Coral[] = [];

    ultimoCentroHueco = 260;;

    jugando = signal(false);
    terminado = signal(false);
    puntos = signal(0);
    record = signal(0);

    constructor() {
        this.pez = this.crearPezInicial();
        const bestScore = localStorage.getItem('flappyFishRecord');

        if (bestScore) {
            this.record.set(Number(bestScore));
        }
    }

    reiniciar(): void {

        this.pez = this.crearPezInicial();
        this.corales = [];

        this.jugando.set(false);
        this.terminado.set(false);
        this.puntos.set(0);
    }

    gameOver(): void {

        this.actualizarRecord();

        this.terminado.set(true);

    }

    updatePhysics(canvasHeight: number): void {

        if (!this.jugando() || this.terminado()) {
            return;
        }

        this.pez.vy += this.GRAVEDAD;
        this.pez.y += this.pez.vy;

        // techo
        if (this.pez.y - this.pez.tam < 0) {
            this.pez.y = this.pez.tam;
        }

        // Suelo
        if (this.pez.y + this.pez.tam > canvasHeight) {
            this.gameOver();
        }

        console.log(this.pez.y);
    }

    private crearPezInicial(): Fish {
        return { x: 90, y: 260, vy: 0, tam: 26 };
    }

    nuevoCoral(canvasWidth: number, canvasHeight: number): void {

        const margen = 100;
        const desplazamientoMax = 120;
        const nuevoCentro = this.ultimoCentroHueco + (Math.random() * 2 - 1) * desplazamientoMax;
        const centroHueco = Math.max(margen, Math.min(canvasHeight - margen, nuevoCentro));
        
        this.ultimoCentroHueco = centroHueco;
        this.corales.push({ x: canvasWidth, centro: centroHueco, sumado: false });

    }

    updateCorales(canvasWidth: number, canvasHeight: number): void {

        if (!this.jugando() || this.terminado()) {
            return;
        }

        if (this.corales.length === 0 ||
            this.corales[this.corales.length - 1].x <
            canvasWidth - this.distanciaCorales
        ) {

            this.nuevoCoral(canvasWidth, canvasHeight);
        }

        this.corales.forEach(c => { c.x -= this.velocidadActual; });
        this.corales = this.corales.filter(c => c.x > -this.ANCHO_CORAL);
    }

    get nivel(): number {

        if (this.puntos() < 10) return 1;
        if (this.puntos() < 20) return 2;
        if (this.puntos() < 30) return 3;

        return 4;
    }

    get velocidadActual(): number {

        switch (this.nivel) {

            case 1: return 2.6;
            case 2: return 3.5;
            case 3: return 4.5;
            case 4: return 5.5;
            default: return 2.6;
        }
    }

    get huecoActual(): number {

        return Math.max(180 - this.puntos(), 120);
    }

    get distanciaCorales(): number {

        return Math.max(260 - this.puntos(), 160);
    }

    updateScore(): void {

        this.corales.forEach(coral => {

            if (!coral.sumado && coral.x + this.ANCHO_CORAL < this.pez.x) {

                coral.sumado = true;

                this.puntos.update(value => value + 1);
            }
        });
    }

    checkCollisions(canvasHeight: number): void {

        if (!this.jugando() || this.terminado()) {
            return;
        }

        // TECHO
        if (this.pez.y - this.pez.tam < 0) {

            this.gameOver();
            return;
        }

        // SUELO
        if (this.pez.y + this.pez.tam > canvasHeight) {

            this.gameOver();
            return;
        }

        // CORALES
        for (const coral of this.corales) {

            const dentroX = this.pez.x + this.pez.tam >
                coral.x && this.pez.x - this.pez.tam <
                coral.x + this.ANCHO_CORAL;

            const fueraHueco = this.pez.y - this.pez.tam <
                coral.centro - this.huecoActual / 2 ||
                this.pez.y + this.pez.tam > coral.centro +
                this.huecoActual / 2;

            if (dentroX && fueraHueco) {

                this.gameOver();
                return;
            }
        }
    }

    actualizarRecord(): void {

        if (this.puntos() > this.record()) {

            this.record.set(this.puntos());

            localStorage.setItem('flappyFishRecord', this.record().toString());
        }
    }

    get rotacionPez(): number {

        return Math.max(-0.6, Math.min(0.8, this.pez.vy * 0.06));

    }


}