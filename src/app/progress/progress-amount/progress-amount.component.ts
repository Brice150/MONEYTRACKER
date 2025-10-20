import { CommonModule } from '@angular/common';
import { Component, EventEmitter, input, Output } from '@angular/core';
import { ProgressAmount } from '../../core/interfaces/progress-amount';

@Component({
  selector: 'app-progress-amount',
  imports: [CommonModule],
  templateUrl: './progress-amount.component.html',
  styleUrl: './progress-amount.component.css',
})
export class ProgressAmountComponent {
  readonly progressAmount = input.required<ProgressAmount>();
  @Output() updateEvent = new EventEmitter<void>();
  @Output() deleteEvent = new EventEmitter<void>();

  update() {
    this.updateEvent.emit();
  }

  delete(): void {
    this.deleteEvent.emit();
  }
}
