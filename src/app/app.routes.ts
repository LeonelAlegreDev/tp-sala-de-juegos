import { Routes } from '@angular/router';
import { isLoggedIn } from './guards/isLoggedIn.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/juegos', pathMatch: "full" },
    { 
        path: 'juegos', 
        loadComponent: () => import('./views/juegos/juegos.component').then(m => m.JuegosComponent),
        canActivate: [isLoggedIn],
    },
    {
        path: 'juegos/:id',
        loadComponent: () => import('./views/juego/juego.component').then(m => m.JuegoComponent),
    },
    {
        path: 'games',
        loadChildren: () => import('./modules/games/games.module').then(m => m.GamesModule),
        canActivate: [isLoggedIn],
    },
    { 
        path: 'login',
        loadComponent: () => import('./views/login-view/login-view.component').then(m => m.LoginViewComponent)
    },
    { 
        path: 'signup',
        loadComponent: () => import('./views/signup-view/signup-view.component').then(m => m.SignupViewComponent)
    },
    { 
        path: 'about-me',
        loadComponent: () => import('./views/about-me/about-me.component').then(m => m.AboutMeComponent),
        canActivate: [isLoggedIn]
    },
    { 
        path: 'profile',
        loadComponent: () => import('./views/profile/profile.component').then(m => m.ProfileComponent),
        canActivate: [isLoggedIn]
    },
    { 
        path: 'welcome',
        loadComponent: () => import('./views/home-view/home-view.component').then(m => m.HomeViewComponent) 
    },
    { path: '**', redirectTo: '/juegos' } // Redirige a juegos si la ruta no existe
];
