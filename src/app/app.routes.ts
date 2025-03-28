import { Routes } from '@angular/router';
import { ConnectComponent } from './connect/connect.component';
import { noUserGuard } from './core/guards/no-user.guard';
import { userGuard } from './core/guards/user.guard';
import { ProfileComponent } from './profile/profile.component';
import { ExpensesComponent } from './expenses/expenses.component';
import { InvestmentsComponent } from './investments/investments.component';
import { InvestmentsSimulatorComponent } from './investments/investments-simulator/investments-simulator.component';
import { RealEstateComponent } from './real-estate/real-estate.component';
import { RealEstateSimulatorComponent } from './real-estate/real-estate-simulator/real-estate-simulator.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  { path: 'connect', component: ConnectComponent, canActivate: [noUserGuard] },
  { path: '', component: HomeComponent, canActivate: [userGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [userGuard] },
  { path: 'expenses', component: ExpensesComponent, canActivate: [userGuard] },
  {
    path: 'investments',
    component: InvestmentsComponent,
    canActivate: [userGuard],
  },
  {
    path: 'investments/simulator',
    component: InvestmentsSimulatorComponent,
    canActivate: [userGuard],
  },
  {
    path: 'real-estate',
    component: RealEstateComponent,
    canActivate: [userGuard],
  },
  {
    path: 'real-estate/simulator',
    component: RealEstateSimulatorComponent,
    canActivate: [userGuard],
  },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
