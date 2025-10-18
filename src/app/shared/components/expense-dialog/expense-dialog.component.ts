import { CommonModule } from '@angular/common';
import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ToastrService } from 'ngx-toastr';
import { Color } from '../../../core/enums/color.enum';
import { Expense } from '../../../core/interfaces/expense';

@Component({
  selector: 'app-expense-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './expense-dialog.component.html',
  styleUrl: './expense-dialog.component.css',
})
export class ExpenseDialogComponent implements OnInit {
  expense: Expense = {} as Expense;
  colorKeys: (keyof typeof Color)[] = Object.keys(
    Color
  ) as (keyof typeof Color)[];
  Color = Color;
  toastr = inject(ToastrService);

  constructor(
    public dialogRef: MatDialogRef<ExpenseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Expense
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.expense = this.data;
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    if (
      this.expense.amount >= 0 &&
      this.expense.amount != null &&
      this.expense.title
    ) {
      this.dialogRef.close(this.expense);
    } else {
      this.toastr.info('Invalid expense', 'Expense', {
        positionClass: 'toast-bottom-center',
        toastClass: 'ngx-toastr custom error',
      });
    }
  }
}
