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
import { UserService } from './user.service';
import { RealEstates } from '../interfaces/real-estates';

@Injectable({ providedIn: 'root' })
export class RealEstatesService {
  firestore = inject(Firestore);
  userService = inject(UserService);
  realEstatesCollection = collection(this.firestore, 'real-estates');

  getRealEstates(): Observable<RealEstates[]> {
    const userId = this.userService.auth.currentUser?.uid;
    const realEstatesCollection = query(
      collection(this.firestore, 'real-estates'),
      where('userId', '==', userId)
    );
    return collectionData(realEstatesCollection, {
      idField: 'id',
    }) as Observable<RealEstates[]>;
  }

  addRealEstates(realEstates: RealEstates): Observable<string> {
    const realEstatesDoc = doc(this.realEstatesCollection);
    realEstates.id = realEstatesDoc.id;
    realEstates.userId = this.userService.auth.currentUser?.uid;

    return from(setDoc(realEstatesDoc, { ...realEstates })).pipe(
      map(() => realEstates.id)
    );
  }

  updateRealEstates(realEstates: RealEstates): Observable<void> {
    if (!realEstates.id) {
      return from(Promise.reject('Real Estates ID missing'));
    }
    const realEstatesDoc = doc(
      this.firestore,
      `real-estates/${realEstates.id}`
    );
    return from(updateDoc(realEstatesDoc, { ...realEstates }));
  }

  deleteRealEstates(realEstatesId: string): Observable<void> {
    const realEstatesDoc = doc(this.firestore, `real-estates/${realEstatesId}`);
    return from(deleteDoc(realEstatesDoc));
  }

  deleteUserRealEstates(): Observable<void> {
    const realEstatesQuery = query(
      this.realEstatesCollection,
      where('userId', '==', this.userService.auth.currentUser?.uid)
    );

    return collectionData(realEstatesQuery, { idField: 'id' }).pipe(
      take(1),
      switchMap((realEstates: any[]) => {
        if (realEstates.length === 0) {
          return of(undefined);
        }

        const deleteRequests = realEstates.map((realEstates: RealEstates) => {
          const realEstatesDoc = doc(
            this.firestore,
            `real-estates/${realEstates.id}`
          );
          return deleteDoc(realEstatesDoc);
        });

        return combineLatest(deleteRequests);
      }),
      map(() => undefined)
    );
  }
}
