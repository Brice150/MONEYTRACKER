import { CommonModule } from '@angular/common';
import { Component, EventEmitter, input, Output } from '@angular/core';
import { Expense } from '../../core/interfaces/expense';

@Component({
  selector: 'app-expense',
  imports: [CommonModule],
  templateUrl: './expense.component.html',
  styleUrl: './expense.component.css',
})
export class ExpenseComponent {
  readonly expense = input.required<Expense>();
  @Output() updateEvent = new EventEmitter<void>();
  @Output() deleteEvent = new EventEmitter<void>();

  update() {
    this.updateEvent.emit();
  }

  delete(): void {
    this.deleteEvent.emit();
  }
}
