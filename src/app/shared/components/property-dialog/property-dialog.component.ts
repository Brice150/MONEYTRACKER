import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  PropertyType,
  PropertyTypeIcons,
} from '../../../core/enums/property-type.enum';
import { Property } from '../../../core/interfaces/property';

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
    this.dialogRef.close(this.property);
  }
}
