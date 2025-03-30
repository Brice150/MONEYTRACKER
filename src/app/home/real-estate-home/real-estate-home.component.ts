import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RealEstate } from '../../core/interfaces/real-estate';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-real-estate-home',
  imports: [CommonModule, RouterModule, MatProgressSpinnerModule],
  templateUrl: './real-estate-home.component.html',
  styleUrl: './real-estate-home.component.css',
})
export class RealEstateHomeComponent {
  @Input() realEstate: RealEstate = {} as RealEstate;
  @Input() loading: boolean = false;

  getTotal(): number {
    let total: number = 0;
    if (
      !this.realEstate.properties ||
      this.realEstate.properties.length === 0
    ) {
      return 0;
    }

    for (let realEstate of this.realEstate.properties) {
      total += realEstate.price;
    }
    return total;
  }
}
