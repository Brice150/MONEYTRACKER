import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { UserService } from './core/services/user.service';
import { Subject, takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  userService = inject(UserService);
  router = inject(Router);
  toastr = inject(ToastrService);
  destroyed$ = new Subject<void>();

  ngOnInit(): void {
    this.userService.user$.pipe(takeUntil(this.destroyed$)).subscribe({
      next: (user) => {
        if (user) {
          this.userService.currentUserSig.set({
            email: user.email!,
          });
        } else {
          this.userService.currentUserSig.set(null);
        }
      },
      error: (error: HttpErrorResponse) => {
        if (!error.message.includes('Missing or insufficient permissions.')) {
          this.toastr.error(error.message, 'Connexion', {
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

  logout(): void {
    this.userService
      .logout()
      .pipe(takeUntil(this.destroyed$))
      .subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (error: HttpErrorResponse) => {
          if (!error.message.includes('Missing or insufficient permissions.')) {
            this.toastr.error(error.message, 'Déconnexion', {
              positionClass: 'toast-bottom-center',
              toastClass: 'ngx-toastr custom error',
            });
          }
        },
      });
  }
}
