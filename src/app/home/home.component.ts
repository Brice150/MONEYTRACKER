import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ExpensesHomeComponent } from './expenses-home/expenses-home.component';
import { InvestmentsHomeComponent } from './investments-home/investments-home.component';
import { RealEstateHomeComponent } from './real-estate-home/real-estate-home.component';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    ExpensesHomeComponent,
    InvestmentsHomeComponent,
    RealEstateHomeComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {}
