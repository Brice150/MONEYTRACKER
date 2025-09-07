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
import { RealEstateSimulator } from '../interfaces/real-estate-simulator';
import { UserService } from './user.service';

@Injectable({ providedIn: 'root' })
export class RealEstateSimulatorService {
  firestore = inject(Firestore);
  userService = inject(UserService);
  realEstateSimulatorCollection = collection(
    this.firestore,
    'real-estate-simulator'
  );

  getRealEstateSimulator(): Observable<RealEstateSimulator[]> {
    const userId = this.userService.auth.currentUser?.uid;
    const realEstateSimulatorCollection = query(
      collection(this.firestore, 'real-estate-simulator'),
      where('userId', '==', userId)
    );
    return collectionData(realEstateSimulatorCollection, {
      idField: 'id',
    }) as Observable<RealEstateSimulator[]>;
  }

  addRealEstateSimulator(
    realEstateSimulator: RealEstateSimulator
  ): Observable<string> {
    const realEstateSimulatorDoc = doc(this.realEstateSimulatorCollection);
    realEstateSimulator.id = realEstateSimulatorDoc.id;
    realEstateSimulator.userId = this.userService.auth.currentUser?.uid;

    return from(
      setDoc(realEstateSimulatorDoc, { ...realEstateSimulator })
    ).pipe(map(() => realEstateSimulator.id));
  }

  updateRealEstateSimulator(
    realEstateSimulator: RealEstateSimulator
  ): Observable<void> {
    if (!realEstateSimulator.id) {
      return from(Promise.reject('Real Estates ID missing'));
    }
    const realEstateSimulatorDoc = doc(
      this.firestore,
      `real-estate-simulator/${realEstateSimulator.id}`
    );
    return from(updateDoc(realEstateSimulatorDoc, { ...realEstateSimulator }));
  }

  deleteRealEstateSimulator(realEstateSimulatorId: string): Observable<void> {
    const realEstateSimulatorDoc = doc(
      this.firestore,
      `real-estate/${realEstateSimulatorId}`
    );
    return from(deleteDoc(realEstateSimulatorDoc));
  }

  deleteUserRealEstateSimulator(): Observable<void> {
    const realEstateSimulatorQuery = query(
      this.realEstateSimulatorCollection,
      where('userId', '==', this.userService.auth.currentUser?.uid)
    );

    return collectionData(realEstateSimulatorQuery, { idField: 'id' }).pipe(
      take(1),
      switchMap((realEstateSimulator: any[]) => {
        if (realEstateSimulator.length === 0) {
          return of(undefined);
        }

        const deleteRequests = realEstateSimulator.map(
          (realEstateSimulator: RealEstateSimulator) => {
            const realEstateSimulatorDoc = doc(
              this.firestore,
              `real-estate-simulator/${realEstateSimulator.id}`
            );
            return deleteDoc(realEstateSimulatorDoc);
          }
        );

        return combineLatest(deleteRequests);
      }),
      map(() => undefined)
    );
  }
}
