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
import { InvestmentsSimulator } from '../interfaces/investments-simulator';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class InvestmentsSimulatorService {
  firestore = inject(Firestore);
  userService = inject(UserService);
  investmentsSimulatorCollection = collection(
    this.firestore,
    'investments-simulator'
  );

  getInvestmentsSimulator(): Observable<InvestmentsSimulator[]> {
    const userId = this.userService.auth.currentUser?.uid;
    const investmentsSimulatorCollection = query(
      collection(this.firestore, 'investments-simulator'),
      where('userId', '==', userId)
    );
    return collectionData(investmentsSimulatorCollection, {
      idField: 'id',
    }) as Observable<InvestmentsSimulator[]>;
  }

  addInvestmentsSimulator(
    investmentsSimulator: InvestmentsSimulator
  ): Observable<string> {
    const investmentsSimulatorDoc = doc(this.investmentsSimulatorCollection);
    investmentsSimulator.id = investmentsSimulatorDoc.id;
    investmentsSimulator.userId = this.userService.auth.currentUser?.uid;

    return from(
      setDoc(investmentsSimulatorDoc, { ...investmentsSimulator })
    ).pipe(map(() => investmentsSimulator.id));
  }

  updateInvestmentsSimulator(
    investmentsSimulator: InvestmentsSimulator
  ): Observable<void> {
    if (!investmentsSimulator.id) {
      return from(Promise.reject('Investments Simulator ID missing.'));
    }
    const investmentsSimulatorDoc = doc(
      this.firestore,
      `investments-simulator/${investmentsSimulator.id}`
    );
    return from(
      updateDoc(investmentsSimulatorDoc, { ...investmentsSimulator })
    );
  }

  deleteInvestmentsSimulator(investmentsSimulatorId: string): Observable<void> {
    const investmentsSimulatorDoc = doc(
      this.firestore,
      `investments-simulator/${investmentsSimulatorId}`
    );
    return from(deleteDoc(investmentsSimulatorDoc));
  }

  deleteUserInvestmentsSimulator(): Observable<void> {
    const investmentsSimulatorQuery = query(
      this.investmentsSimulatorCollection,
      where('userId', '==', this.userService.auth.currentUser?.uid)
    );

    return collectionData(investmentsSimulatorQuery, { idField: 'id' }).pipe(
      take(1),
      switchMap((investmentsSimulator: any[]) => {
        if (investmentsSimulator.length === 0) {
          return of(undefined);
        }

        const deleteRequests = investmentsSimulator.map(
          (investmentsSimulator: InvestmentsSimulator) => {
            const investmentsSimulatorDoc = doc(
              this.firestore,
              `investments-simulator/${investmentsSimulator.id}`
            );
            return deleteDoc(investmentsSimulatorDoc);
          }
        );

        return combineLatest(deleteRequests);
      }),
      map(() => undefined)
    );
  }
}
