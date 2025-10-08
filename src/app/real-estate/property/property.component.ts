import { CommonModule } from '@angular/common';
import { Component, EventEmitter, input, Output } from '@angular/core';
import { Property } from '../../core/interfaces/property';
import { PropertyTypeIcons } from '../../core/enums/property-type.enum';

@Component({
  selector: 'app-property',
  imports: [CommonModule],
  templateUrl: './property.component.html',
  styleUrl: './property.component.css',
})
export class PropertyComponent {
  readonly property = input.required<Property>();
  propertyTypeIcons = PropertyTypeIcons;
  @Output() updateSessionEvent = new EventEmitter<void>();
  @Output() deleteSessionEvent = new EventEmitter<void>();

  update() {
    this.updateSessionEvent.emit();
  }

  delete(): void {
    this.deleteSessionEvent.emit();
  }
}
