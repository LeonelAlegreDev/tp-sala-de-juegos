import { Routes } from '@angular/router';
import { LoginViewComponent } from './views/login-view/login-view.component';
import { HomeViewComponent } from './views/home-view/home-view.component';
import { SignupViewComponent } from './views/signup-view/signup-view.component';
import { AboutMeComponent } from './views/about-me/about-me.component';
import { JuegosComponent } from './views/juegos/juegos.component';
import { ProfileComponent } from './views/profile/profile.component';
import { MayorMenorComponent } from './views/mayor-menor/mayor-menor.component';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: "full" },
    { path: 'home', component: HomeViewComponent},
    { path: 'login', component: LoginViewComponent},
    { path: 'signup', component: SignupViewComponent},
    { path: 'about-me', component: AboutMeComponent},
    { path: 'juegos', component: JuegosComponent, },
    { path: 'profile', component: ProfileComponent },
    { path: "juegos/mayor-menor", component: MayorMenorComponent }
];
