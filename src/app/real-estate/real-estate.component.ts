import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject, take, takeUntil } from 'rxjs';
import { PropertyType } from '../core/enums/property-type.enum';
import { RealEstate } from '../core/interfaces/real-estate';
import { RealEstateService } from '../core/services/real-estate.service';
import { DisableScrollDirective } from '../shared/directives/disable-scroll.directive';

@Component({
  selector: 'app-real-estate',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    RouterModule,
    DisableScrollDirective,
  ],
  templateUrl: './real-estate.component.html',
  styleUrl: './real-estate.component.css',
})
export class RealEstateComponent implements OnInit, OnDestroy {
  realEstate: RealEstate = {} as RealEstate;
  toastr = inject(ToastrService);
  realEstateService = inject(RealEstateService);
  loading: boolean = true;
  destroyed$ = new Subject<void>();
  updateNeeded: boolean = false;
  PropertyType: string[] = Object.values(PropertyType);

  ngOnInit(): void {
    this.realEstateService
      .getRealEstate()
      .pipe(take(1), takeUntil(this.destroyed$))
      .subscribe({
        next: (realEstate: RealEstate[]) => {
          if (realEstate[0]?.properties?.length > 0) {
            this.realEstate = realEstate[0];
          } else {
            this.realEstate.properties = [];
          }
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.loading = false;
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Real Estate', {
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

  deleteProperty(index: number): void {
    this.realEstate.properties.splice(index, 1);
    this.saveUserRealEstates('deleted');
  }

  addProperty(): void {
    this.realEstate.properties.push({
      type: PropertyType.HOUSE,
      city: 'Paris',
      price: 10000,
      rent: 0,
      surface: 40,
      ownershipRatio: 100,
    });
    this.saveUserRealEstates('added');
  }

  updateProperties(): void {
    if (
      !this.realEstate.properties.some(
        (property) =>
          property.surface < 0 ||
          property.price < 0 ||
          property.rent < 0 ||
          property.ownershipRatio < 0 ||
          property.ownershipRatio > 100
      ) &&
      this.realEstate.properties.every(
        (property) =>
          property.city &&
          property.surface !== undefined &&
          property.surface !== null &&
          property.price !== undefined &&
          property.price !== null &&
          property.ownershipRatio !== undefined &&
          property.ownershipRatio !== null &&
          property.rent !== undefined &&
          property.rent !== null
      )
    ) {
      this.saveUserRealEstates('updated');
    } else {
      this.toastr.info('Invalid property', 'Real Estate', {
        positionClass: 'toast-bottom-center',
        toastClass: 'ngx-toastr custom error',
      });
    }
  }

  saveUserRealEstates(toastrMessage: string): void {
    this.loading = true;
    if (!this.realEstate.id) {
      this.realEstateService
        .addRealEstate(this.realEstate)
        .pipe(takeUntil(this.destroyed$))
        .subscribe({
          next: () => {
            this.loading = false;
            this.toastr.info('Property added', 'Real Estate', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom info',
            });
          },
          error: (error: HttpErrorResponse) => {
            this.loading = false;
            if (
              !error.message.includes('Missing or insufficient permissions.')
            ) {
              this.toastr.error(error.message, 'Real Estate', {
                positionClass: 'toast-bottom-center',
                toastClass: 'ngx-toastr custom error',
              });
            }
          },
        });
    } else {
      this.realEstateService
        .updateRealEstate(this.realEstate)
        .pipe(takeUntil(this.destroyed$))
        .subscribe({
          next: () => {
            this.loading = false;
            this.updateNeeded = false;
            this.toastr.info('Properties ' + toastrMessage, 'Real Estate', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom info',
            });
          },
          error: (error: HttpErrorResponse) => {
            this.loading = false;
            if (
              !error.message.includes('Missing or insufficient permissions.')
            ) {
              this.toastr.error(error.message, 'Real Estate', {
                positionClass: 'toast-bottom-center',
                toastClass: 'ngx-toastr custom error',
              });
            }
          },
        });
    }
  }

  toggleUpdateNeeded(): void {
    this.updateNeeded = true;
  }

  getTotal(): number {
    let total: number = 0;
    if (
      !this.realEstate.properties ||
      this.realEstate.properties.length === 0
    ) {
      return 0;
    }

    for (let property of this.realEstate.properties) {
      total += property.price * (property.ownershipRatio / 100);
    }
    return total;
  }

  getTotalRent(): number {
    let total: number = 0;
    if (
      !this.realEstate.properties ||
      this.realEstate.properties.length === 0
    ) {
      return 0;
    }

    for (let property of this.realEstate.properties) {
      total += property.rent * (property.ownershipRatio / 100);
    }
    return total;
  }
}
