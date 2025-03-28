import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-investments-home',
  imports: [CommonModule, RouterModule],
  templateUrl: './investments-home.component.html',
  styleUrl: './investments-home.component.css',
})
export class InvestmentsHomeComponent {}
