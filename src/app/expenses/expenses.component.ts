import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import Chart from 'chart.js/auto';
import { ToastrService } from 'ngx-toastr';
import { Subject, take, takeUntil } from 'rxjs';
import { Color } from '../core/enums/color.enum';
import { Expense } from '../core/interfaces/expense';
import { Expenses } from '../core/interfaces/expenses';
import { ExpensesService } from '../core/services/expenses.service';
import { DisableScrollDirective } from '../shared/directives/disable-scroll.directive';

@Component({
  selector: 'app-expenses',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    DisableScrollDirective,
  ],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.css',
})
export class ExpensesComponent implements OnInit, OnDestroy {
  expenses: Expenses = {} as Expenses;
  doughnutGraph?: Chart<'doughnut', number[], string>;
  colorKeys: (keyof typeof Color)[] = Object.keys(
    Color
  ) as (keyof typeof Color)[];
  Color = Color;
  toastr = inject(ToastrService);
  expensesService = inject(ExpensesService);
  loading: boolean = true;
  destroyed$ = new Subject<void>();
  updateNeeded: boolean = false;
  updateNeededIncome: boolean = false;

  ngOnInit(): void {
    this.expenses.expenses = [];
    this.expensesService
      .getExpenses()
      .pipe(take(1), takeUntil(this.destroyed$))
      .subscribe({
        next: (expenses: Expenses[]) => {
          if (expenses[0]?.expenses?.length >= 0) {
            this.expenses = expenses[0];
          }
          this.loading = false;
          this.displayExpensesGraph();
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Expenses', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
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
                (expense: Expense) => expense.amount
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
              position: 'bottom',
              labels: {
                padding: 40,
                font: {
                  size: 16,
                  weight: 800,
                },
                color: 'white',
              },
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

  updateExpensesGraph(): void {
    if (this.doughnutGraph) {
      this.doughnutGraph.data.labels = this.expenses.expenses.map(
        (expense: Expense) => expense.title
      );
      this.doughnutGraph.data.datasets[0].data = this.expenses.expenses.map(
        (expense: Expense) => expense.amount
      );
      this.doughnutGraph.data.datasets[0].backgroundColor =
        this.expenses.expenses.map((expense: Expense) => expense.color);
      this.doughnutGraph.update();
    }
  }

  toggleUpdateNeeded(): void {
    this.updateNeeded = true;
  }

  toggleUpdateNeededIncome(): void {
    this.updateNeededIncome = true;
  }

  saveUserExpenses(toastrMessage: string): void {
    this.loading = true;
    if (!this.expenses.id) {
      this.expensesService
        .addExpenses(this.expenses)
        .pipe(takeUntil(this.destroyed$))
        .subscribe({
          next: () => {
            this.loading = false;
            this.updateExpensesGraph();
            this.toastr.info('Expense added', 'Expenses', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom info',
            });
          },
          error: (error: HttpErrorResponse) => {
            this.loading = false;
            if (
              !error.message.includes('Missing or insufficient permissions.')
            ) {
              this.toastr.error(error.message, 'Expenses', {
                positionClass: 'toast-bottom-center',
                toastClass: 'ngx-toastr custom error',
              });
            }
          },
        });
    } else {
      this.expensesService
        .updateExpenses(this.expenses)
        .pipe(takeUntil(this.destroyed$))
        .subscribe({
          next: () => {
            this.loading = false;
            this.updateExpensesGraph();
            this.updateNeeded = false;
            this.updateNeededIncome = false;
            this.toastr.info('Expense ' + toastrMessage, 'Expenses', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom info',
            });
          },
          error: (error: HttpErrorResponse) => {
            this.loading = false;
            if (
              !error.message.includes('Missing or insufficient permissions.')
            ) {
              this.toastr.error(error.message, 'Expenses', {
                positionClass: 'toast-bottom-center',
                toastClass: 'ngx-toastr custom error',
              });
            }
          },
        });
    }
  }

  deleteExpense(index: number): void {
    this.expenses.expenses.splice(index, 1);
    this.saveUserExpenses('deleted');
  }

  addExpense(): void {
    const usedColors: Color[] = this.expenses.expenses.map(
      (expense) => expense.color
    );
    const unusedColors: Color[] = Object.values(Color).filter(
      (color) => !usedColors.includes(color)
    );

    let newColor: Color = Color.BLUE;

    if (unusedColors.length !== 0) {
      newColor = unusedColors[0];
    } else {
      newColor = usedColors[Math.floor(Math.random() * usedColors.length)];
    }

    this.expenses.expenses.push({
      title: 'Expense',
      amount: 100,
      color: newColor,
    });
    this.saveUserExpenses('added');
  }

  updateExpenses(): void {
    const expensesValid =
      !this.expenses.expenses.some((expense) => expense.amount < 0) &&
      this.expenses.expenses.every(
        (expense) =>
          expense.amount !== undefined &&
          expense.amount !== null &&
          expense.title
      );

    const incomeValid =
      this.expenses.income != undefined &&
      this.expenses.income != null &&
      this.expenses.income >= this.getTotal();

    if (expensesValid && incomeValid) {
      this.saveUserExpenses('updated');
    } else if (!expensesValid) {
      this.toastr.info('Invalid expense', 'Expenses', {
        positionClass: 'toast-bottom-center',
        toastClass: 'ngx-toastr custom error',
      });
    } else if (!incomeValid) {
      this.toastr.info('Invalid income', 'Income', {
        positionClass: 'toast-bottom-center',
        toastClass: 'ngx-toastr custom error',
      });
    }
  }

  getTotal(): number {
    let total: number = 0;
    if (!this.expenses.expenses || this.expenses.expenses.length === 0) {
      return 0;
    }

    for (let expense of this.expenses.expenses) {
      total += expense.amount;
    }
    return total;
  }
}
