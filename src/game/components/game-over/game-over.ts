import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameEngineService } from '../../services/game-engine';

@Component({
  selector: 'app-game-over',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-over.html',
  styleUrl: './game-over.css'
})
export class GameOverComponent {

  constructor(
    public engine: GameEngineService
  ) {}

  retry(): void {
    this.engine.reiniciar();
  }
}