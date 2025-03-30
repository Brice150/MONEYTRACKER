import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Expenses } from '../../core/interfaces/expenses';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-expenses-home',
  imports: [CommonModule, RouterModule, MatProgressSpinnerModule],
  templateUrl: './expenses-home.component.html',
  styleUrl: './expenses-home.component.css',
})
export class ExpensesHomeComponent {
  @Input() expenses: Expenses = {} as Expenses;
  @Input() loading: boolean = false;

  getTotal(): number {
    let total: number = 0;
    if (!this.expenses.expenses || this.expenses.expenses.length === 0) {
      return 0;
    }

    for (let expense of this.expenses.expenses) {
      total += expense.totalAmount;
    }
    return total;
  }
}
