import { CommonModule } from '@angular/common';
import { Component, OnChanges, SimpleChanges, input } from '@angular/core';
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
  readonly expenses = input<Expenses>({} as Expenses);
  readonly loading = input<boolean>(false);
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
          labels: this.expenses().expenses.map(
            (expense: Expense) => expense.title
          ),
          datasets: [
            {
              label: 'Expenses',
              data: this.expenses().expenses.map(
                (expense: Expense) => expense.amount
              ),
              backgroundColor: this.expenses().expenses.map(
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
            tooltip: {
              callbacks: {
                label: (tooltipItem: any) => {
                  let dataset = tooltipItem.dataset;
                  let total = dataset.data.reduce(
                    (acc: number, value: number) => acc + value,
                    0
                  );
                  let currentValue = Math.round(
                    dataset.data[tooltipItem.dataIndex]
                  ).toLocaleString('fr-FR');
                  let percentage = (
                    (dataset.data[tooltipItem.dataIndex] / total) *
                    100
                  ).toFixed(0);

                  return `${currentValue} (${percentage}%)`;
                },
              },
            },
          },
          color: '#006aff',
        },
      });
    }
  }

  getTotal(): number {
    let total: number = 0;
    const expenses = this.expenses();
    if (!expenses.expenses || expenses.expenses.length === 0) {
      return 0;
    }

    for (let expense of expenses.expenses) {
      total += expense.amount;
    }
    return total;
  }
}
