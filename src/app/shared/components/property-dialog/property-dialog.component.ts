import { CommonModule } from '@angular/common';
import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Color } from '../../../core/enums/color.enum';
import {
  PropertyType,
  PropertyTypeIcons,
} from '../../../core/enums/property-type.enum';
import { Property } from '../../../core/interfaces/property';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-property-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './property-dialog.component.html',
  styleUrl: './property-dialog.component.css',
})
export class PropertyDialogComponent implements OnInit {
  property: Property = {} as Property;
  propertyTypes = Object.values(PropertyType);
  propertyTypeIcons = PropertyTypeIcons;
  colorKeys: (keyof typeof Color)[] = Object.keys(
    Color
  ) as (keyof typeof Color)[];
  Color = Color;
  toastr = inject(ToastrService);

  constructor(
    public dialogRef: MatDialogRef<PropertyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Property
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.property = this.data;
    }
  }

  cancel(): void {
    this.dialogRef.close(false);
  }

  confirm(): void {
    if (
      this.property.city &&
      this.property.ownershipRatio != null &&
      this.property.ownershipRatio > 0 &&
      this.property.ownershipRatio <= 100 &&
      this.property.price != null &&
      this.property.price > 0 &&
      this.property.remainingLoan != null &&
      this.property.remainingLoan >= 0 &&
      this.property.rent != null &&
      this.property.rent >= 0 &&
      this.property.surface != null &&
      this.property.surface >= 0 &&
      this.property.type
    ) {
      this.dialogRef.close(this.property);
    } else {
      this.toastr.info('Invalid property', 'Property', {
        positionClass: 'toast-bottom-center',
        toastClass: 'ngx-toastr custom error',
      });
    }
  }
}
