import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { filter, Subject, switchMap, takeUntil } from 'rxjs';
import { PropertyType } from '../core/enums/property-type.enum';
import { Property } from '../core/interfaces/property';
import { RealEstate } from '../core/interfaces/real-estate';
import { RealEstateService } from '../core/services/real-estate.service';
import { PropertyDialogComponent } from '../shared/components/property-dialog/property-dialog.component';
import { PropertyComponent } from './property/property.component';
import { ConfirmationDialogComponent } from '../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-real-estate',
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    RouterModule,
    PropertyComponent,
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
  dialog = inject(MatDialog);

  ngOnInit(): void {
    this.realEstateService
      .getRealEstate()
      .pipe(takeUntil(this.destroyed$))
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

  addProperty(): void {
    this.realEstate.properties.push({
      type: PropertyType.HOUSE,
      city: 'Paris',
      price: 10000,
      rent: 0,
      surface: 40,
      ownershipRatio: 100,
      remainingLoan: 0,
    });
    this.saveUserRealEstates('added');
  }

  updateProperty(property: Property, index: number): void {
    const dialogRef = this.dialog.open(PropertyDialogComponent, {
      data: structuredClone(property),
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((res) => !!res),
        switchMap((res: Property) => {
          this.loading = true;
          this.realEstate.properties[index] = res;
          return this.realEstateService.updateRealEstate(this.realEstate);
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: () => {
          this.loading = false;
          this.toastr.info('Property updated', 'Real Estate', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom info',
          });
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

  deleteProperty(propertyIndex: number): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: 'delete this property',
    });

    dialogRef
      .afterClosed()
      .pipe(
        filter((res: boolean) => res),
        switchMap(() => {
          this.loading = true;
          this.realEstate.properties.splice(propertyIndex, 1);
          return this.realEstateService.updateRealEstate(this.realEstate);
        }),
        takeUntil(this.destroyed$)
      )
      .subscribe({
        next: () => {
          this.loading = false;
          this.toastr.info('Property deleted', 'Real Estate', {
            positionClass: 'toast-bottom-center',
            toastClass: 'ngx-toastr custom info',
          });
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

  getTotal(): number {
    let total: number = 0;
    if (
      !this.realEstate.properties ||
      this.realEstate.properties.length === 0
    ) {
      return 0;
    }

    for (let property of this.realEstate.properties) {
      total +=
        (property.price - property.remainingLoan) *
        (property.ownershipRatio / 100);
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
