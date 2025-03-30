import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Investments } from '../../core/interfaces/investments';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-investments-home',
  imports: [CommonModule, RouterModule, MatProgressSpinnerModule],
  templateUrl: './investments-home.component.html',
  styleUrl: './investments-home.component.css',
})
export class InvestmentsHomeComponent {
  @Input() investments: Investments = {} as Investments;
  @Input() loading: boolean = false;

  getTotal(): number {
    let total: number = 0;
    if (
      !this.investments.investments ||
      this.investments.investments.length === 0
    ) {
      return 0;
    }

    for (let investment of this.investments.investments) {
      total += investment.totalAmount;
    }
    return total;
  }
}
