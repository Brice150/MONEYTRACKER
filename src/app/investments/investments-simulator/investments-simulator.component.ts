import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Chart } from 'chart.js';
import { InvestmentsSimulator } from '../../core/interfaces/investments-simulator';
import { ToastrService } from 'ngx-toastr';
import { DisableScrollDirective } from '../../shared/directives/disable-scroll.directive';
import { Subject, take, takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { InvestmentsSimulatorService } from '../../core/services/investments-simulator.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-investments-simulator',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    DisableScrollDirective,
    MatProgressSpinnerModule,
  ],
  templateUrl: './investments-simulator.component.html',
  styleUrl: './investments-simulator.component.css',
})
export class InvestmentsSimulatorComponent implements OnInit, OnDestroy {
  investmentsSimulator: InvestmentsSimulator = {} as InvestmentsSimulator;
  barGraph?: Chart<'bar', number[], string>;
  toastr = inject(ToastrService);
  investmentsSimulatorService = inject(InvestmentsSimulatorService);
  loading: boolean = true;
  destroyed$ = new Subject<void>();
  updateNeeded: boolean = false;

  ngOnInit(): void {
    this.investmentsSimulatorService
      .getInvestmentsSimulator()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (investmentsSimulator: InvestmentsSimulator[]) => {
          if (investmentsSimulator[0]) {
            this.investmentsSimulator = investmentsSimulator[0];
            this.loading = false;
            this.displayGraph();
          } else {
            this.initData();
          }
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Investments Simulator', {
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

  initData(): void {
    const investmentsSimulator: InvestmentsSimulator = {
      totalAmount: 1000,
      amountPerMonth: 100,
      percentage: 8,
      goalAmount: 10000,
      monthsToGoal: undefined,
      yearly: {
        date: Array.from({ length: 41 }, (_, i) => i.toString()),
        invested: [1000],
        interests: [0],
        total: [1000],
      },
    } as InvestmentsSimulator;

    this.investmentsSimulator = investmentsSimulator;
    this.calculateAmounts();
    this.calculateGoal();

    this.investmentsSimulatorService
      .addInvestmentsSimulator(this.investmentsSimulator)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          this.loading = false;
          this.displayGraph();
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Investments Simulator', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });
  }

  displayGraph(): void {
    const graph = document.getElementById(
      'barGraph'
    ) as HTMLCanvasElement | null;
    if (graph) {
      this.barGraph = new Chart(graph, {
        type: 'bar',
        data: {
          labels: this.investmentsSimulator.yearly.date,
          datasets: [
            {
              label: 'Invested',
              data: this.investmentsSimulator.yearly.invested,
              backgroundColor: '#006aff',
            },
            {
              label: 'Interests',
              data: this.investmentsSimulator.yearly.interests,
              backgroundColor: '#45d606',
            },
          ],
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

  calculateAmounts(): void {
    this.investmentsSimulator.yearly.invested[0] =
      this.investmentsSimulator.totalAmount;
    this.investmentsSimulator.yearly.interests[0] = 0;
    this.investmentsSimulator.yearly.total[0] =
      this.investmentsSimulator.totalAmount;

    for (
      let index = 1;
      index < this.investmentsSimulator.yearly.date.length;
      index++
    ) {
      let invested: number =
        this.investmentsSimulator.yearly.invested[index - 1];
      let interests: number =
        this.investmentsSimulator.yearly.interests[index - 1];

      invested += this.investmentsSimulator.amountPerMonth * 12;
      interests +=
        (invested + interests) * (this.investmentsSimulator.percentage / 100);

      this.investmentsSimulator.yearly.invested[index] = invested;
      this.investmentsSimulator.yearly.interests[index] = interests;
      this.investmentsSimulator.yearly.total[index] = invested + interests;
    }
  }

  calculateGoal(): void {
    if (!this.investmentsSimulator.goalAmount) return;

    const totals = this.investmentsSimulator.yearly.total;

    for (let year = 0; year < totals.length; year++) {
      if (totals[year] >= this.investmentsSimulator.goalAmount) {
        if (year === 0) {
          this.investmentsSimulator.monthsToGoal = 0;
          return;
        }

        const prevTotal = totals[year - 1];
        const currTotal = totals[year];

        const diffNeeded = this.investmentsSimulator.goalAmount - prevTotal;
        const diffYear = currTotal - prevTotal;
        const fraction = diffNeeded / diffYear;

        this.investmentsSimulator.monthsToGoal = Math.round(
          (year - 1 + fraction) * 12
        );

        if (this.investmentsSimulator.monthsToGoal < 1) {
          this.investmentsSimulator.monthsToGoal = 1;
        }

        return;
      }
    }
  }

  update(goalChanged = false): void {
    if (!this.isFormValid()) {
      this.toastr.info('Invalid Simulator', 'Investments Simulator', {
        positionClass: 'toast-bottom-center',
        toastClass: 'ngx-toastr custom error',
      });
      return;
    }

    this.updateNeeded = true;

    if (goalChanged) {
      this.calculateGoal();
      return;
    }

    this.calculateAmounts();
    this.calculateGoal();
    this.updateGraph();
  }

  isFormValid(): boolean {
    return (
      !(this.investmentsSimulator.totalAmount < 0) &&
      this.investmentsSimulator.totalAmount !== undefined &&
      this.investmentsSimulator.totalAmount !== null &&
      !(this.investmentsSimulator.amountPerMonth < 0) &&
      this.investmentsSimulator.amountPerMonth !== undefined &&
      this.investmentsSimulator.amountPerMonth !== null &&
      !(
        this.investmentsSimulator.percentage < 0 ||
        this.investmentsSimulator.percentage > 100
      ) &&
      this.investmentsSimulator.percentage !== undefined &&
      this.investmentsSimulator.percentage !== null
    );
  }

  updateSimulator(): void {
    if (!this.isFormValid()) {
      this.toastr.info('Invalid Simulator', 'Investments Simulator', {
        positionClass: 'toast-bottom-center',
        toastClass: 'ngx-toastr custom error',
      });
      return;
    }

    this.investmentsSimulatorService
      .updateInvestmentsSimulator(this.investmentsSimulator)
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          this.updateNeeded = false;
          this.toastr.info('Simulator updated', 'Investments Simulator', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom info',
          });
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Investments Simulator', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });
  }

  updateGraph(): void {
    if (this.barGraph) {
      this.barGraph.data.labels = this.investmentsSimulator.yearly.date;
      this.barGraph.data.datasets = [
        {
          label: 'Invested',
          data: this.investmentsSimulator.yearly.invested,
          backgroundColor: '#006aff',
        },
        {
          label: 'Interests',
          data: this.investmentsSimulator.yearly.interests,
          backgroundColor: '#45d606',
        },
      ];
      this.barGraph.update();
    }
  }
}
