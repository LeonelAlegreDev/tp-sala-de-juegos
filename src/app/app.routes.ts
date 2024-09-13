import { Routes } from '@angular/router';
import { LoginViewComponent } from './views/login-view/login-view.component';
import { HomeViewComponent } from './views/home-view/home-view.component';
import { SignupViewComponent } from './views/signup-view/signup-view.component';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: "full" },
    { path: 'home', component: HomeViewComponent},
    { path: 'login', component: LoginViewComponent},
    { path: 'signup', component: SignupViewComponent}
];
