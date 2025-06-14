import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Investments } from '../core/interfaces/investments';
import { Chart } from 'chart.js';
import { Color } from '../core/enums/color.enum';
import { ToastrService } from 'ngx-toastr';
import { InvestmentsService } from '../core/services/investments.service';
import { Subject, take, takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Investment } from '../core/interfaces/investment';
import { RouterModule } from '@angular/router';
import { DisableScrollDirective } from '../shared/directives/disable-scroll.directive';

@Component({
  selector: 'app-investments',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    RouterModule,
    DisableScrollDirective,
  ],
  templateUrl: './investments.component.html',
  styleUrl: './investments.component.css',
})
export class InvestmentsComponent implements OnInit, OnDestroy {
  investments: Investments = {} as Investments;
  doughnutGraph?: Chart<'doughnut', number[], string>;
  barGraph?: Chart<'bar', number[], string>;
  colorKeys: (keyof typeof Color)[] = Object.keys(
    Color
  ) as (keyof typeof Color)[];
  Color = Color;
  toastr = inject(ToastrService);
  investmentsService = inject(InvestmentsService);
  loading: boolean = true;
  destroyed$ = new Subject<void>();
  updateNeeded: boolean = false;

  ngOnInit(): void {
    this.investments.investments = [];
    this.investmentsService
      .getInvestments()
      .pipe(take(1), takeUntil(this.destroyed$))
      .subscribe({
        next: (investments: Investments[]) => {
          if (investments[0]?.investments?.length >= 0) {
            this.investments = investments[0];
          }
          this.loading = false;
          this.displayInvestmentsDoughnutGraph();
          this.displayInvestmentsBarGraph();
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Investments', {
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

  displayInvestmentsDoughnutGraph(): void {
    const graph = document.getElementById(
      'investmentsDoughnutGraph'
    ) as HTMLCanvasElement | null;

    if (graph) {
      this.doughnutGraph = new Chart(graph, {
        type: 'doughnut',
        data: {
          labels: this.investments.investments.map(
            (investment: Investment) => investment.title
          ),
          datasets: [
            {
              label: 'Investments',
              data: this.investments.investments.map(
                (investment: Investment) => investment.totalAmount
              ),
              backgroundColor: this.investments.investments.map(
                (investment: Investment) => investment.color
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

  displayInvestmentsBarGraph(): void {
    const yearlyData = this.calculateYearlyTotals();
    const labels = yearlyData.map((data) => `${data.year}`);
    const datasets = this.investments.investments.map((investment, index) => {
      return {
        label: investment.title,
        data: yearlyData.map((data) => data.totals[index]),
        backgroundColor: investment.color,
      };
    });

    const graph = document.getElementById(
      'investmentsBarGraph'
    ) as HTMLCanvasElement | null;

    if (graph) {
      this.barGraph = new Chart(graph, {
        type: 'bar',
        data: {
          labels,
          datasets,
        },
        options: {
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 20,
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
                  let dataset = tooltipItem.chart.data.datasets;
                  let dataIndex = tooltipItem.dataIndex;
                  let totalColumn = dataset.reduce(
                    (sum: number, ds: any) => sum + (ds.data[dataIndex] || 0),
                    0
                  );

                  let currentValue = Math.round(tooltipItem.raw).toLocaleString(
                    'fr-FR'
                  );
                  let percentage = (
                    (tooltipItem.raw / totalColumn) *
                    100
                  ).toFixed(0);

                  return `${currentValue} (${percentage}%)`;
                },
              },
            },
          },
          scales: {
            x: {
              stacked: true,
              title: {
                display: true,
                text: 'Years',
                font: {
                  size: 18,
                  weight: 800,
                },
                color: '#006aff',
              },
              ticks: {
                color: 'white',
              },
              grid: {
                color: 'transparent',
              },
              border: {
                color: 'white',
              },
            },
            y: {
              stacked: true,
              title: {
                display: true,
                text: 'Total Amount (€)',
                font: {
                  size: 18,
                  weight: 800,
                },
                color: '#006aff',
              },
              ticks: {
                color: 'white',
              },
              grid: {
                color: 'white',
              },
              border: {
                color: 'white',
              },
            },
          },
        },
      });
    }
  }

  updateInvestmentsDoughnutGraph(): void {
    if (this.doughnutGraph) {
      this.doughnutGraph.data.labels = this.investments.investments.map(
        (investment: Investment) => investment.title
      );
      this.doughnutGraph.data.datasets[0].data =
        this.investments.investments.map(
          (investment: Investment) => investment.totalAmount
        );
      this.doughnutGraph.data.datasets[0].backgroundColor =
        this.investments.investments.map(
          (investment: Investment) => investment.color
        );
      this.doughnutGraph.update();
    }
  }

  updateInvestmentsBarGraph(): void {
    if (this.barGraph) {
      const yearlyData = this.calculateYearlyTotals();
      const labels = yearlyData.map((data) => `${data.year}`);
      const datasets = this.investments.investments.map((investment, index) => {
        return {
          label: investment.title,
          data: yearlyData.map((data) => data.totals[index]),
          backgroundColor: investment.color,
        };
      });

      this.barGraph.data.labels = labels;
      this.barGraph.data.datasets = datasets;
      this.barGraph.update();
    }
  }

  calculateYearlyTotals(): { year: number; totals: number[] }[] {
    const years = 40;
    const results: { year: number; totals: number[] }[] = [];

    for (let year = 1; year <= years; year++) {
      const yearlyTotals = this.investments.investments.map(
        (investment, index) => {
          const previousTotal = results[year - 2]?.totals || [];
          const previousAmount = previousTotal[index] || investment.totalAmount;
          const newAmount =
            previousAmount + (previousAmount * investment.interestRate) / 100;
          return newAmount;
        }
      );
      results.push({ year, totals: yearlyTotals });
    }

    return results;
  }

  toggleUpdateNeeded(): void {
    this.updateNeeded = true;
  }

  saveUserInvestments(toastrMessage: string): void {
    this.loading = true;
    if (!this.investments.id) {
      this.investmentsService
        .addInvestments(this.investments)
        .pipe(takeUntil(this.destroyed$))
        .subscribe({
          next: () => {
            this.loading = false;
            this.updateInvestmentsDoughnutGraph();
            this.updateInvestmentsBarGraph();
            this.toastr.info('Investment added', 'Investments', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom info',
            });
          },
          error: (error: HttpErrorResponse) => {
            this.loading = false;
            if (
              !error.message.includes('Missing or insufficient permissions.')
            ) {
              this.toastr.error(error.message, 'Investments', {
                positionClass: 'toast-bottom-center',
                toastClass: 'ngx-toastr custom error',
              });
            }
          },
        });
    } else {
      this.investmentsService
        .updateInvestments(this.investments)
        .pipe(takeUntil(this.destroyed$))
        .subscribe({
          next: () => {
            this.loading = false;
            this.updateInvestmentsDoughnutGraph();
            this.updateInvestmentsBarGraph();
            this.updateNeeded = false;
            this.toastr.info('Investment ' + toastrMessage, 'Investments', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom info',
            });
          },
          error: (error: HttpErrorResponse) => {
            this.loading = false;
            if (
              !error.message.includes('Missing or insufficient permissions.')
            ) {
              this.toastr.error(error.message, 'Investments', {
                positionClass: 'toast-bottom-center',
                toastClass: 'ngx-toastr custom error',
              });
            }
          },
        });
    }
  }

  deleteInvestment(index: number): void {
    this.investments.investments.splice(index, 1);
    this.saveUserInvestments('deleted');
  }

  addInvestment(): void {
    const usedColors: Color[] = this.investments.investments.map(
      (investment) => investment.color
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

    this.investments.investments.push({
      title: 'Investment',
      totalAmount: 100,
      interestRate: 2,
      color: newColor,
    });
    this.saveUserInvestments('added');
  }

  updateInvestments(): void {
    if (
      !this.investments.investments.some(
        (investment) =>
          investment.totalAmount < 0 ||
          investment.interestRate < 0 ||
          investment.interestRate > 100
      ) &&
      this.investments.investments.every(
        (investment) =>
          investment.title &&
          investment.totalAmount !== undefined &&
          investment.totalAmount !== null &&
          investment.interestRate !== undefined &&
          investment.interestRate !== null
      )
    ) {
      this.saveUserInvestments('updated');
    } else {
      this.toastr.info('Invalid investment', 'Investments', {
        positionClass: 'toast-bottom-center',
        toastClass: 'ngx-toastr custom error',
      });
    }
  }

  getTotal(): number {
    let total: number = 0;
    if (
      !this.investments.investments ||
      this.investments.investments.length === 0
    ) {
      return 0;
    }

    for (let investment of this.investments.investments) {
      total += investment.totalAmount;
    }
    return total;
  }
}
