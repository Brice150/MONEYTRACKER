import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { combineLatest, Subject, takeUntil } from 'rxjs';
import { Expenses } from '../core/interfaces/expenses';
import { Investments } from '../core/interfaces/investments';
import { RealEstate } from '../core/interfaces/real-estate';
import { ExpensesService } from '../core/services/expenses.service';
import { InvestmentsService } from '../core/services/investments.service';
import { RealEstateService } from '../core/services/real-estate.service';
import { ExpensesHomeComponent } from './expenses-home/expenses-home.component';
import { InvestmentsHomeComponent } from './investments-home/investments-home.component';
import { RealEstateHomeComponent } from './real-estate-home/real-estate-home.component';

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
  realEstate: RealEstate = {} as RealEstate;
  expensesService = inject(ExpensesService);
  investmentsService = inject(InvestmentsService);
  realEstateService = inject(RealEstateService);
  toastr = inject(ToastrService);
  loading: boolean = true;
  destroyed$ = new Subject<void>();

  ngOnInit(): void {
    this.expenses.expenses = [];
    this.investments.investments = [];
    this.realEstate.properties = [];
    this.loading = true;

    combineLatest([
      this.expensesService.getExpenses(),
      this.investmentsService.getInvestments(),
      this.realEstateService.getRealEstate(),
    ])
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: ([expenses, investments, realEstate]) => {
          if (expenses[0]?.expenses?.length > 0) {
            this.expenses = expenses[0];
          }
          if (investments[0]?.investments?.length > 0) {
            this.investments = investments[0];
          }
          if (realEstate[0]?.properties?.length > 0) {
            this.realEstate = realEstate[0];
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
