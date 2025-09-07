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
import { RealEstate } from '../interfaces/real-estate';

@Injectable({ providedIn: 'root' })
export class RealEstateService {
  firestore = inject(Firestore);
  userService = inject(UserService);
  realEstateCollection = collection(this.firestore, 'real-estate');

  getRealEstate(): Observable<RealEstate[]> {
    const userId = this.userService.auth.currentUser?.uid;
    const realEstateCollection = query(
      collection(this.firestore, 'real-estate'),
      where('userId', '==', userId)
    );
    return collectionData(realEstateCollection, {
      idField: 'id',
    }) as Observable<RealEstate[]>;
  }

  addRealEstate(realEstate: RealEstate): Observable<string> {
    const realEstateDoc = doc(this.realEstateCollection);
    realEstate.id = realEstateDoc.id;
    realEstate.userId = this.userService.auth.currentUser?.uid;

    return from(setDoc(realEstateDoc, { ...realEstate })).pipe(
      map(() => realEstate.id)
    );
  }

  updateRealEstate(realEstate: RealEstate): Observable<void> {
    if (!realEstate.id) {
      return from(Promise.reject('Real Estates ID missing'));
    }
    const realEstateDoc = doc(this.firestore, `real-estate/${realEstate.id}`);
    return from(updateDoc(realEstateDoc, { ...realEstate }));
  }

  deleteRealEstate(realEstateId: string): Observable<void> {
    const realEstateDoc = doc(this.firestore, `real-estate/${realEstateId}`);
    return from(deleteDoc(realEstateDoc));
  }

  deleteUserRealEstate(): Observable<void> {
    const realEstateQuery = query(
      this.realEstateCollection,
      where('userId', '==', this.userService.auth.currentUser?.uid)
    );

    return collectionData(realEstateQuery, { idField: 'id' }).pipe(
      take(1),
      switchMap((realEstate: any[]) => {
        if (realEstate.length === 0) {
          return of(undefined);
        }

        const deleteRequests = realEstate.map((realEstate: RealEstate) => {
          const realEstateDoc = doc(
            this.firestore,
            `real-estate/${realEstate.id}`
          );
          return deleteDoc(realEstateDoc);
        });

        return combineLatest(deleteRequests);
      }),
      map(() => undefined)
    );
  }
}
