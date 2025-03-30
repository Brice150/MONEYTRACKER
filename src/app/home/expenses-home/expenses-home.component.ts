import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { Chart } from 'chart.js';
import { Expense } from '../../core/interfaces/expense';
import { Expenses } from '../../core/interfaces/expenses';

@Component({
  selector: 'app-expenses-home',
  imports: [CommonModule, RouterModule, MatProgressSpinnerModule],
  templateUrl: './expenses-home.component.html',
  styleUrl: './expenses-home.component.css',
})
export class ExpensesHomeComponent implements OnChanges {
  @Input() expenses: Expenses = {} as Expenses;
  @Input() loading: boolean = false;
  doughnutGraph?: Chart<'doughnut', number[], string>;

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['loading'] &&
      !changes['loading'].firstChange &&
      changes['loading'].previousValue &&
      !changes['loading'].currentValue
    ) {
      this.displayExpensesGraph();
    }
  }

  displayExpensesGraph(): void {
    const graph = document.getElementById(
      'expensesDoughnutGraph'
    ) as HTMLCanvasElement | null;

    if (graph) {
      this.doughnutGraph = new Chart(graph, {
        type: 'doughnut',
        data: {
          labels: this.expenses.expenses.map(
            (expense: Expense) => expense.title
          ),
          datasets: [
            {
              label: 'Expenses',
              data: this.expenses.expenses.map(
                (expense: Expense) => expense.totalAmount
              ),
              backgroundColor: this.expenses.expenses.map(
                (expense: Expense) => expense.color
              ),
            },
          ],
        },
        options: {
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          color: '#006aff',
        },
      });
    }
  }

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
