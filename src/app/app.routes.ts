import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('../game/pages/game/game')
            .then(m => m.Game)
    }
];
