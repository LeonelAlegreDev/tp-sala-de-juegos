import { Routes } from '@angular/router';
import { LoginViewComponent } from './views/login-view/login-view.component';
import { HomeViewComponent } from './views/home-view/home-view.component';
import { SignupViewComponent } from './views/signup-view/signup-view.component';
import { AboutMeComponent } from './views/about-me/about-me.component';
import { JuegosComponent } from './views/juegos/juegos.component';
import { ProfileComponent } from './views/profile/profile.component';
import { MayorMenorComponent } from './components/juegos/mayor-menor/mayor-menor.component';
import { AhorcadoComponent } from './components/juegos/ahorcado/ahorcado.component';
import { JuegoComponent } from './views/juego/juego.component';

export const routes: Routes = [
    { path: '', redirectTo: '/juegos', pathMatch: "full" },
    { path: 'juegos', component: JuegosComponent},
    { path: 'login', component: LoginViewComponent},
    { path: 'signup', component: SignupViewComponent},
    { path: 'about-me', component: AboutMeComponent},
    { path: 'juegos/:id', component: JuegoComponent, },
    { path: 'profile', component: ProfileComponent },
];
