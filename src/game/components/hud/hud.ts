import { Component } from "@angular/core";
import { GameEngineService } from "../../services/game-engine";

@Component({
    selector: 'app-hud',
    standalone: true,
    templateUrl: './hud.html',
    styleUrl: './hud.css'
})

export class HudComponent {

    constructor(public engine: GameEngineService) {}

}