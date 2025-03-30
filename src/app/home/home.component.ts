import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ExpensesHomeComponent } from './expenses-home/expenses-home.component';
import { InvestmentsHomeComponent } from './investments-home/investments-home.component';
import { RealEstateHomeComponent } from './real-estate-home/real-estate-home.component';
import { Expenses } from '../core/interfaces/expenses';
import { Investments } from '../core/interfaces/investments';
import { RealEstates } from '../core/interfaces/real-estates';
import { ExpensesService } from '../core/services/expenses.service';
import { InvestmentsService } from '../core/services/investments.service';
import { RealEstatesService } from '../core/services/real-estates.service';
import { combineLatest, Subject, take, takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    ExpensesHomeComponent,
    InvestmentsHomeComponent,
    RealEstateHomeComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  expenses: Expenses = {} as Expenses;
  investments: Investments = {} as Investments;
  realEstates: RealEstates = {} as RealEstates;
  expensesService = inject(ExpensesService);
  investmentsService = inject(InvestmentsService);
  realEstatesService = inject(RealEstatesService);
  toastr = inject(ToastrService);
  loading: boolean = true;
  destroyed$ = new Subject<void>();

  ngOnInit(): void {
    this.loading = true;

    combineLatest([
      this.expensesService.getExpenses(),
      this.investmentsService.getInvestments(),
      this.realEstatesService.getRealEstates(),
    ])
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: ([expenses, investments, realEstates]) => {
          if (expenses[0]?.expenses?.length > 0) {
            this.expenses = expenses[0];
          } else {
            this.expenses.expenses = [];
          }
          if (investments[0]?.investments?.length > 0) {
            this.investments = investments[0];
          } else {
            this.investments.investments = [];
          }
          if (realEstates[0]?.realEstates?.length > 0) {
            this.realEstates = realEstates[0];
          } else {
            this.realEstates.realEstates = [];
          }
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Error', {
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
}
