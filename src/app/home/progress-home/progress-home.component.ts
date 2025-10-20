import { CommonModule, DatePipe } from '@angular/common';
import { Component, input, OnChanges, SimpleChanges } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { Chart } from 'chart.js';
import { Progress } from '../../core/interfaces/progress';

@Component({
  selector: 'app-progress-home',
  imports: [CommonModule, RouterModule, MatProgressSpinnerModule],
  templateUrl: './progress-home.component.html',
  styleUrl: './progress-home.component.css',
})
export class ProgressHomeComponent implements OnChanges {
  readonly progress = input<Progress>({} as Progress);
  readonly loading = input<boolean>(false);
  lineGraph?: Chart<'line', number[], string>;
  datePipe: DatePipe = new DatePipe('fr');

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['loading'] &&
      !changes['loading'].firstChange &&
      changes['loading'].previousValue &&
      !changes['loading'].currentValue &&
      this.progress().progressAmounts?.length > 0
    ) {
      this.displayProgressLineGraph();
    }
  }

  displayProgressLineGraph(): void {
    const graph = document.getElementById(
      'progressLineGraph'
    ) as HTMLCanvasElement | null;
    if (graph) {
      this.lineGraph = new Chart(graph, {
        type: 'line',
        data: {
          labels: this.progress().progressAmounts.map(
            (measure) => this.datePipe.transform(measure.date, 'dd/MM/yyyy')!
          ),
          datasets: [
            {
              label: 'Total Amount (€)',
              data: this.progress().progressAmounts.map(
                (progressAmount) => progressAmount.amount
              ),
              backgroundColor: '#45d606',
              borderColor: '#45d606',
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
          scales: {
            x: {
              title: {
                display: true,
                text: 'Date',
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
}
