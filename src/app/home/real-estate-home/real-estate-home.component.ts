import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
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
  readonly realEstate = input<RealEstate>({} as RealEstate);
  readonly loading = input<boolean>(false);

  getTotal(): number {
    let total: number = 0;
    const realEstate = this.realEstate();
    if (
      !realEstate.properties ||
      realEstate.properties.length === 0
    ) {
      return 0;
    }

    for (let property of realEstate.properties) {
      total += property.price * (property.ownershipRatio / 100);
    }
    return total;
  }

  getTotalRent(): number {
    let total: number = 0;
    const realEstate = this.realEstate();
    if (
      !realEstate.properties ||
      realEstate.properties.length === 0
    ) {
      return 0;
    }

    for (let property of realEstate.properties) {
      total += property.rent * (property.ownershipRatio / 100);
    }
    return total;
  }
}
