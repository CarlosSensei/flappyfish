import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameEngineService } from '../../services/game-engine';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css'
})
export class MenuComponent {

  constructor(
    public engine: GameEngineService
  ) {}

  start(): void {
    this.engine.jugando.set(true);
    this.engine.terminado.set(false);
  }
}