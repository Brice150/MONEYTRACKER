import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterModule } from '@angular/router';
import { Location } from '@angular/common';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule, MatButtonModule, MatMenuModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  router = inject(Router);
  location = inject(Location);
  toastr = inject(ToastrService);
  @Output() logoutEvent = new EventEmitter<void>();

  menuItems = [
    { path: '/', title: 'Home', icon: 'bx bxs-home' },
    { path: '/profile', title: 'Profile', icon: 'bx bxs-user' },
    { path: '/expenses', title: 'Expenses', icon: 'bx bxs-credit-card-alt' },
    {
      path: '/investments',
      title: 'Investments',
      icon: 'bx bxs-dollar-circle',
    },
    {
      path: '/investments/simulator',
      title: 'Investments Simulator',
      icon: 'bx bxs-bar-chart-alt-2',
    },
    {
      path: '/real-estate',
      title: 'Real Estate',
      icon: 'bx bxs-building-house',
    },
    {
      path: '/real-estate/simulator',
      title: 'Real Estate Simulator',
      icon: 'bx bx-spreadsheet',
    },
  ];

  getTitle(): string {
    const currentItem = this.menuItems.find(
      (item) => item.path === this.router.url
    );

    if (!currentItem || !currentItem.title || currentItem.title === 'Home') {
      return 'Money Tracker';
    }
    return currentItem.title;
  }

  isHomePage(): boolean {
    return this.router.url === '/';
  }

  back(): void {
    this.location.back();
  }

  logout(): void {
    this.logoutEvent.emit();
    this.toastr.info('Logged out', 'Money Tracker', {
      positionClass: 'toast-bottom-center',
      toastClass: 'ngx-toastr custom info',
    });
  }
}
