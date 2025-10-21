import { CommonModule, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { Chart } from 'chart.js';
import { ToastrService } from 'ngx-toastr';
import { filter, Subject, switchMap, takeUntil } from 'rxjs';
import { Progress } from '../core/interfaces/progress';
import { ProgressAmount } from '../core/interfaces/progress-amount';
import { ProgressService } from '../core/services/progress.service';
import { ConfirmationDialogComponent } from '../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ProgressDialogComponent } from '../shared/components/progress-dialog/progress-dialog.component';
import { ProgressAmountComponent } from './progress-amount/progress-amount.component';

@Component({
  selector: 'app-progress',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    RouterModule,
    ProgressAmountComponent,
  ],
  templateUrl: './progress.component.html',
  styleUrl: './progress.component.css',
})
export class ProgressComponent implements OnInit, OnDestroy {
  progress: Progress = {} as Progress;
  lineGraph?: Chart<'line', number[], string>;
  toastr = inject(ToastrService);
  progressService = inject(ProgressService);
  loading: boolean = true;
  destroyed$ = new Subject<void>();
  dialog = inject(MatDialog);
  datePipe: DatePipe = new DatePipe('fr');

  ngOnInit(): void {
    this.progress.progressAmounts = [];
    this.progressService
      .getProgress()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: (progress: Progress[]) => {
          if (progress[0]?.progressAmounts?.length >= 0) {
            this.progress = progress[0];
            this.progress.progressAmounts = this.progress.progressAmounts.map(
              (progressAmount) => ({
                ...progressAmount,
                date:
                  progressAmount.date instanceof Timestamp
                    ? progressAmount.date.toDate()
                    : new Date(progressAmount.date),
              })
            );

            this.progress.progressAmounts.sort(
              (a, b) => a.date.getTime() - b.date.getTime()
            );
          }
          this.loading = false;
          this.displayProgressLineGraph();
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Progress', {
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

  displayProgressLineGraph(): void {
    const graph = document.getElementById(
      'progressLineGraph'
    ) as HTMLCanvasElement | null;
    if (graph) {
      this.lineGraph = new Chart(graph, {
        type: 'line',
        data: {
          labels: this.progress.progressAmounts.map(
            (progressAmount) =>
              this.datePipe.transform(progressAmount.date, 'MM/yyyy')!
          ),
          datasets: [
            {
              label: 'Total Amount (€)',
              data: this.progress.progressAmounts.map(
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

  updateProgressLineGraph(): void {
    if (this.lineGraph) {
      this.lineGraph.data.labels = this.progress.progressAmounts.map(
        (progressAmount) =>
          this.datePipe.transform(progressAmount.date, 'dd/MM/yyyy')!
      );
      this.lineGraph.data.datasets[0].data = this.progress.progressAmounts.map(
        (progressAmount) => progressAmount.amount
      );
      this.lineGraph.update();
    }
  }

  saveUserProgress(toastrMessage: string): void {
    this.loading = true;
    if (!this.progress.id) {
      this.progressService
        .addProgress(this.progress)
        .pipe(takeUntil(this.destroyed$))
        .subscribe({
          next: () => {
            this.loading = false;
            this.updateProgressLineGraph();
            this.toastr.info('Progress added', 'Progress', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom info',
            });
          },
          error: (error: HttpErrorResponse) => {
            this.loading = false;
            if (
              !error.message.includes('Missing or insufficient permissions.')
            ) {
              this.toastr.error(error.message, 'Progress', {
                positionClass: 'toast-bottom-center',
                toastClass: 'ngx-toastr custom error',
              });
            }
          },
        });
    } else {
      this.progressService
        .updateProgress(this.progress)
        .pipe(takeUntil(this.destroyed$))
        .subscribe({
          next: () => {
            this.loading = false;
            this.updateProgressLineGraph();
            this.toastr.info('Progress ' + toastrMessage, 'Progress', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom info',
            });
          },
          error: (error: HttpErrorResponse) => {
            this.loading = false;
            if (
              !error.message.includes('Missing or insufficient permissions.')
            ) {
              this.toastr.error(error.message, 'Progress', {
                positionClass: 'toast-bottom-center',
                toastClass: 'ngx-toastr custom error',
              });
            }
          },
        });
    }
  }

  deleteProgress(invesmentIndex: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: 'delete this progress',
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((res: boolean) => res),
        switchMap(() => {
          this.loading = true;
          this.progress.progressAmounts.splice(invesmentIndex, 1);
          return this.progressService.updateProgress(this.progress);
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: () => {
          this.loading = false;
          this.updateProgressLineGraph();
          this.toastr.info('Progress deleted', 'Progress', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom info',
          });
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Progress', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });
  }

  addProgress(): void {
    this.progress.progressAmounts.push({
      amount: 1000,
      date: new Date(),
    });
    this.saveUserProgress('added');
  }

  updateProgress(progressAmount: ProgressAmount, index: number): void {
    const dialogRef = this.dialog.open(ProgressDialogComponent, {
      data: structuredClone(progressAmount),
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((res) => !!res),
        switchMap((res: ProgressAmount) => {
          this.loading = true;
          this.progress.progressAmounts[index] = res;
          return this.progressService.updateProgress(this.progress);
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: () => {
          this.loading = false;
          this.updateProgressLineGraph();
          this.toastr.info('Progress updated', 'Progress', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom info',
          });
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Progress', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });
  }

  getTotal(): number {
    if (
      !this.progress.progressAmounts ||
      this.progress.progressAmounts.length === 0
    ) {
      return 0;
    }

    return this.progress.progressAmounts[
      this.progress.progressAmounts.length - 1
    ].amount;
  }
}
