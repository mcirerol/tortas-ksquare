import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { EventProvider } from '../event/event';
import { take } from 'rxjs/operator/take';

/*
  Generated class for the UserProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class UserProvider {
  userState;

  constructor(private db: AngularFireDatabase) {
    console.log('Hello UserProvider Provider');
  }

  saveOrUpdateUser(name, uid) {
    return this.getUserData(uid).then(result => {
      console.log('user in db retrieved save', result)
      if (result) {
        return Promise.resolve('ok');
      }
      return this.setUserWithParticipants(uid, name);
    })
  }



  private getParticipantsEvents(events, uid, userName) {
    const participants = {};
    Object.keys(events).forEach(eventKey => {
      const event = events[eventKey];
      participants[eventKey] = {
        status: 'initial',
        amount: 0,
        eventName: event.name,
        eventDueDate: event.duedate,
        eventKey,
        userKey: uid,
        name: userName
      }
    })
    return participants;
  }

  public setUserWithParticipants(uid, userName) {
    return new Promise((resolve, reject) => {
      this.db.object('events-ids').valueChanges().take(1).subscribe((events) => {
        const updates = {};
        const ref = this.db.object('/');
        console.log(events, 'events');
        updates[`users/${uid}/name`] = userName;
        updates[`users-ids/${uid}`] = { name: userName };
        if (events != null) {
          updates[`users/${uid}/participants`] = this.getParticipantsEvents(events, uid, userName);
          Object.keys(events).forEach(eventKey => {
            const event = events[eventKey];
            updates[`events/${eventKey}/participants/${uid}`] = {
              status: 'initial',
              amount: 0,
              eventName: event.name,
              eventDueDate: event.duedate,
              eventKey,
              name: userName,
              userKey: uid
            }
          })
        }
        console.log('updates', updates)
        ref.update(updates).then(() => resolve(), () => reject());
      }, (error) => {
        reject(error);
      })
    })

  }

  getUserData(uid) {
    return new Promise((resolve, reject) => {
      const userRef = this.db.object(`users-ids/${uid}`);
      return userRef.valueChanges().take(1).subscribe((data) => {
        resolve(data);
      }, () => reject());
    });

  }

  getCurrentUserState() {
    return this.userState;
  }

  setUserState(state) {
    this.userState = state;
  }

}
