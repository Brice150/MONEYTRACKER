import { CommonModule } from '@angular/common';
import { Component, EventEmitter, input, Output } from '@angular/core';
import { Investment } from '../../core/interfaces/investment';

@Component({
  selector: 'app-investment',
  imports: [CommonModule],
  templateUrl: './investment.component.html',
  styleUrl: './investment.component.css',
})
export class InvestmentComponent {
  readonly investment = input.required<Investment>();
  @Output() updateEvent = new EventEmitter<void>();
  @Output() deleteEvent = new EventEmitter<void>();

  update() {
    this.updateEvent.emit();
  }

  delete(): void {
    this.deleteEvent.emit();
  }
}
