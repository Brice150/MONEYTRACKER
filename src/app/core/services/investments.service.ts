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
import { Investments } from '../interfaces/investments';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class InvestmentsService {
  firestore = inject(Firestore);
  userService = inject(UserService);
  investmentsCollection = collection(this.firestore, 'investments');

  getInvestments(): Observable<Investments[]> {
    const userId = this.userService.auth.currentUser?.uid;
    const investmentsCollection = query(
      collection(this.firestore, 'investments'),
      where('userId', '==', userId)
    );
    return collectionData(investmentsCollection, {
      idField: 'id',
    }) as Observable<Investments[]>;
  }

  addInvestments(investments: Investments): Observable<string> {
    const investmentsDoc = doc(this.investmentsCollection);
    investments.id = investmentsDoc.id;
    investments.userId = this.userService.auth.currentUser?.uid;

    return from(setDoc(investmentsDoc, { ...investments })).pipe(
      map(() => investments.id)
    );
  }

  updateInvestments(investments: Investments): Observable<void> {
    if (!investments.id) {
      return from(Promise.reject('ID de courses manquant.'));
    }
    const investmentsDoc = doc(this.firestore, `Investments/${investments.id}`);
    return from(updateDoc(investmentsDoc, { ...investments }));
  }

  deleteInvestments(investmentsId: string): Observable<void> {
    const investmentsDoc = doc(this.firestore, `investments/${investmentsId}`);
    return from(deleteDoc(investmentsDoc));
  }

  deleteUserInvestments(): Observable<void> {
    const investmentsQuery = query(
      this.investmentsCollection,
      where('userId', '==', this.userService.auth.currentUser?.uid)
    );

    return collectionData(investmentsQuery, { idField: 'id' }).pipe(
      take(1),
      switchMap((investments: any[]) => {
        if (investments.length === 0) {
          return of(undefined);
        }

        const deleteRequests = investments.map((investments: Investments) => {
          const investmentsDoc = doc(
            this.firestore,
            `investments/${investments.id}`
          );
          return deleteDoc(investmentsDoc);
        });

        return combineLatest(deleteRequests);
      }),
      map(() => undefined)
    );
  }
}
