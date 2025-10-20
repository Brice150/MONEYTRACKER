import { CommonModule } from '@angular/common';
import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ToastrService } from 'ngx-toastr';
import { Color } from '../../../core/enums/color.enum';
import { Investment } from '../../../core/interfaces/investment';
import { DisableScrollDirective } from '../../directives/disable-scroll.directive';

@Component({
  selector: 'app-investment-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    DisableScrollDirective,
  ],
  templateUrl: './investment-dialog.component.html',
  styleUrl: './investment-dialog.component.css',
})
export class InvestmentDialogComponent implements OnInit {
  investment: Investment = {} as Investment;
  colorKeys: (keyof typeof Color)[] = Object.keys(
    Color
  ) as (keyof typeof Color)[];
  Color = Color;
  toastr = inject(ToastrService);

  constructor(
    public dialogRef: MatDialogRef<InvestmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Investment
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.investment = this.data;
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    if (
      !(
        this.investment.totalAmount < 0 ||
        this.investment.interestRate < 0 ||
        this.investment.interestRate > 100
      ) &&
      this.investment.title &&
      this.investment.totalAmount != null &&
      this.investment.interestRate != null
    ) {
      this.dialogRef.close(this.investment);
    } else {
      this.toastr.info('Invalid investment', 'Investment', {
        positionClass: 'toast-bottom-center',
        toastClass: 'ngx-toastr custom error',
      });
    }
  }
}
