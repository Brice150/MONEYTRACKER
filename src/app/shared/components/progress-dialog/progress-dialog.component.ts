import { CommonModule } from '@angular/common';
import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ToastrService } from 'ngx-toastr';
import { ProgressAmount } from '../../../core/interfaces/progress-amount';
import { DisableScrollDirective } from '../../directives/disable-scroll.directive';

@Component({
  selector: 'app-progress-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    DisableScrollDirective,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './progress-dialog.component.html',
  styleUrl: './progress-dialog.component.css',
})
export class ProgressDialogComponent implements OnInit {
  progressAmount: ProgressAmount = {} as ProgressAmount;
  toastr = inject(ToastrService);

  constructor(
    public dialogRef: MatDialogRef<ProgressDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProgressAmount
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.progressAmount = this.data;
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    if (
      this.progressAmount.amount >= 0 &&
      this.progressAmount.amount != null &&
      this.progressAmount.date
    ) {
      this.dialogRef.close(this.progressAmount);
    } else {
      this.toastr.info('Invalid progress', 'Progress', {
        positionClass: 'toast-bottom-center',
        toastClass: 'ngx-toastr custom error',
      });
    }
  }
}
