import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Chart } from 'chart.js';
import { InvestmentsSimulator } from '../../core/interfaces/investments-simulator';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-investments-simulator',
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './investments-simulator.component.html',
  styleUrl: './investments-simulator.component.css',
})
export class InvestmentsSimulatorComponent implements OnInit {
  investmentsSimulator: InvestmentsSimulator = {
    totalAmount: 1000,
    amountPerMonth: 100,
    percentage: 8,
    yearly: {
      date: Array.from({ length: 41 }, (_, i) => i.toString()),
      invested: [1000],
      interests: [0],
      total: [1000],
    },
  };
  barGraph?: Chart<'bar', number[], string>;
  toastr = inject(ToastrService);

  ngOnInit(): void {
    this.calculateAmounts();
    this.displayGraph();
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

  update(): void {
    if (this.isFormValid()) {
      this.calculateAmounts();
      this.updateGraph();
    } else {
      this.toastr.info('Invalid Simulator', 'Investments Simulator', {
        positionClass: 'toast-bottom-center',
        toastClass: 'ngx-toastr custom error',
      });
    }
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
