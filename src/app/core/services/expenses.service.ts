import { inject, Injectable } from '@angular/core';
import {
  collection,
  collectionData,
  deleteDoc,
  doc,
  Firestore,
  query,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import {
  combineLatest,
  from,
  map,
  Observable,
  of,
  switchMap,
  take,
} from 'rxjs';
import { Expenses } from '../interfaces/expenses';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class ExpensesService {
  firestore = inject(Firestore);
  userService = inject(UserService);
  expensesCollection = collection(this.firestore, 'expenses');

  getExpenses(): Observable<Expenses[]> {
    const userId = this.userService.auth.currentUser?.uid;
    const expensesCollection = query(
      collection(this.firestore, 'expenses'),
      where('userId', '==', userId)
    );
    return collectionData(expensesCollection, { idField: 'id' }) as Observable<
      Expenses[]
    >;
  }

  addExpenses(expenses: Expenses): Observable<string> {
    const expensesDoc = doc(this.expensesCollection);
    expenses.id = expensesDoc.id;
    expenses.userId = this.userService.auth.currentUser?.uid;

    return from(setDoc(expensesDoc, { ...expenses })).pipe(
      map(() => expenses.id)
    );
  }

  updateExpenses(expenses: Expenses): Observable<void> {
    if (!expenses.id) {
      return from(Promise.reject('ID de courses manquant.'));
    }
    const expensesDoc = doc(this.firestore, `expenses/${expenses.id}`);
    return from(updateDoc(expensesDoc, { ...expenses }));
  }

  deleteExpenses(expensesId: string): Observable<void> {
    const expensesDoc = doc(this.firestore, `expenses/${expensesId}`);
    return from(deleteDoc(expensesDoc));
  }

  deleteUserExpenses(): Observable<void> {
    const expensesQuery = query(
      this.expensesCollection,
      where('userId', '==', this.userService.auth.currentUser?.uid)
    );

    return collectionData(expensesQuery, { idField: 'id' }).pipe(
      take(1),
      switchMap((expenses: any[]) => {
        if (expenses.length === 0) {
          return of(undefined);
        }

        const deleteRequests = expenses.map((expenses: Expenses) => {
          const expensesDoc = doc(this.firestore, `expenses/${expenses.id}`);
          return deleteDoc(expensesDoc);
        });

        return combineLatest(deleteRequests);
      }),
      map(() => undefined)
    );
  }
}
