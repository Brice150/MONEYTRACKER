import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-expenses-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './expenses-home.component.html',
  styleUrl: './expenses-home.component.css',
})
export class ExpensesHomeComponent {}
