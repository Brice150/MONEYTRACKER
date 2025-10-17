import { CommonModule } from '@angular/common';
import { Component, input, OnChanges, SimpleChanges } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RealEstate } from '../../core/interfaces/real-estate';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Chart } from 'chart.js';
import { Property } from '../../core/interfaces/property';

@Component({
  selector: 'app-real-estate-home',
  imports: [CommonModule, RouterModule, MatProgressSpinnerModule],
  templateUrl: './real-estate-home.component.html',
  styleUrl: './real-estate-home.component.css',
})
export class RealEstateHomeComponent implements OnChanges {
  readonly realEstate = input<RealEstate>({} as RealEstate);
  readonly loading = input<boolean>(false);
  doughnutGraph?: Chart<'doughnut', number[], string>;

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['loading'] &&
      !changes['loading'].firstChange &&
      changes['loading'].previousValue &&
      !changes['loading'].currentValue
    ) {
      this.displayRealEstateDoughnutGraph();
    }
  }

  displayRealEstateDoughnutGraph(): void {
    const graph = document.getElementById(
      'realEstateDoughnutGraph'
    ) as HTMLCanvasElement | null;

    if (graph) {
      this.doughnutGraph = new Chart(graph, {
        type: 'doughnut',
        data: {
          labels: this.realEstate().properties.map(
            (property: Property) =>
              `${property.type} - ${
                property.city.length > 25
                  ? property.city.substring(0, 22) + '...'
                  : property.city
              } (${(
                (property.price - property.remainingLoan) *
                (property.ownershipRatio / 100)
              ).toLocaleString('fr-FR')} €)`
          ),
          datasets: [
            {
              label: 'Real Estate',
              data: this.realEstate().properties.map(
                (property: Property) =>
                  (property.price - property.remainingLoan) *
                  (property.ownershipRatio / 100)
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

                  let percentage = (
                    (dataset.data[tooltipItem.dataIndex] / total) *
                    100
                  ).toFixed(0);

                  return `${percentage}%`;
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
    const realEstate = this.realEstate();
    if (!realEstate.properties || realEstate.properties.length === 0) {
      return 0;
    }

    for (let property of realEstate.properties) {
      total +=
        (property.price - property.remainingLoan) *
        (property.ownershipRatio / 100);
    }
    return total;
  }

  getTotalRent(): number {
    let total: number = 0;
    const realEstate = this.realEstate();
    if (!realEstate.properties || realEstate.properties.length === 0) {
      return 0;
    }

    for (let property of realEstate.properties) {
      total += property.rent * (property.ownershipRatio / 100);
    }
    return total;
  }
}
