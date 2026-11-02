import { Component } from '@angular/core';
import { GameCanvasComponent } from '../../components/game-canvas/game-canvas';
import { HudComponent } from '../../components/hud/hud';
import { MenuComponent } from '../../components/menu/menu';
import { GameOverComponent } from '../../components/game-over/game-over';

@Component({
    selector: 'app-game',
    standalone: true,
    imports: [
        GameCanvasComponent,
        HudComponent,
        MenuComponent,
        GameOverComponent
    ],
    templateUrl: './game.html',
    styleUrl: './game.css'
})
export class Game {

}