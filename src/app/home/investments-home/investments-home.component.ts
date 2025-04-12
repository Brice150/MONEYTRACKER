import { CommonModule } from '@angular/common';
import { Component, OnChanges, SimpleChanges, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Investments } from '../../core/interfaces/investments';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Chart } from 'chart.js';
import { Investment } from '../../core/interfaces/investment';

@Component({
  selector: 'app-investments-home',
  imports: [CommonModule, RouterModule, MatProgressSpinnerModule],
  templateUrl: './investments-home.component.html',
  styleUrl: './investments-home.component.css',
})
export class InvestmentsHomeComponent implements OnChanges {
  readonly investments = input<Investments>({} as Investments);
  readonly loading = input<boolean>(false);
  doughnutGraph?: Chart<'doughnut', number[], string>;

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['loading'] &&
      !changes['loading'].firstChange &&
      changes['loading'].previousValue &&
      !changes['loading'].currentValue
    ) {
      this.displayInvestmentsDoughnutGraph();
    }
  }

  displayInvestmentsDoughnutGraph(): void {
    const graph = document.getElementById(
      'investmentsDoughnutGraph'
    ) as HTMLCanvasElement | null;

    if (graph) {
      this.doughnutGraph = new Chart(graph, {
        type: 'doughnut',
        data: {
          labels: this.investments().investments.map(
            (investment: Investment) => investment.title
          ),
          datasets: [
            {
              label: 'Investments',
              data: this.investments().investments.map(
                (investment: Investment) => investment.totalAmount
              ),
              backgroundColor: this.investments().investments.map(
                (investment: Investment) => investment.color
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
    const investments = this.investments();
    if (
      !investments.investments ||
      investments.investments.length === 0
    ) {
      return 0;
    }

    for (let investment of investments.investments) {
      total += investment.totalAmount;
    }
    return total;
  }
}
