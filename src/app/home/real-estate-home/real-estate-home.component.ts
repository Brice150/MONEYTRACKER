import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RealEstates } from '../../core/interfaces/real-estates';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-real-estate-home',
  imports: [CommonModule, RouterModule, MatProgressSpinnerModule],
  templateUrl: './real-estate-home.component.html',
  styleUrl: './real-estate-home.component.css',
})
export class RealEstateHomeComponent {
  @Input() realEstates: RealEstates = {} as RealEstates;
  @Input() loading: boolean = false;

  getTotal(): number {
    let total: number = 0;
    if (
      !this.realEstates.realEstates ||
      this.realEstates.realEstates.length === 0
    ) {
      return 0;
    }

    for (let realEstate of this.realEstates.realEstates) {
      total += realEstate.price;
    }
    return total;
  }
}
