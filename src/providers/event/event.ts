import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Event } from '../../shared/event';
import { UserProvider } from '../user/user';
import { AngularFireDatabase, DATABASE_PROVIDERS } from 'angularfire2/database';
import { Observable } from 'rxjs/Observable';
import { Participant } from '../../shared/participant';
import * as _ from 'lodash';

/*
  Generated class for the EventProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class EventProvider {

  constructor(private userService: UserProvider, private db: AngularFireDatabase) {
    console.log('Hello EventProvider Provider');
  }

  saveEvent(event: Event): Observable<any> {
    return this.getParticipants().map((participants) => {
      return this.saveEventFirebase(event, participants);
    })
  }

  private saveEventFirebase(event: Event, participants) {
    const eventUpdate = Object.assign(event);
    const uid = this.userService.getCurrentUserState().uid;
    const name = this.userService.getCurrentUserState().displayName;
    const eventKey = this.db.createPushId();
    eventUpdate.participants = participants;
    const updates = {};
    const dateChoosed = new Date(event.duedate);
    const dueDateUTC = new Date(dateChoosed.getTime() + dateChoosed.getTimezoneOffset() * 60000);
    console.log(dueDateUTC);
    console.log(event.duedate);
    updates[`events/${eventKey}`] = eventUpdate;
    updates[`events-ids/${eventKey}`] = { name: event.name, duedate: dueDateUTC };
    updates[`users/${uid}/adminEvents/${eventKey}`] = { name: event.name, duedate: dueDateUTC, eventKey };
    Object.keys(participants).forEach(userKey => {
      updates[`users/${userKey}/participants/${eventKey}`] = {
        status: 'initial',
        amount: 0,
        eventName: event.name,
        eventDueDate: dueDateUTC,
        eventKey,
        fondita: eventUpdate.fondita,
        userKey,
        name
      }
    })
    return this.db.object('/').update(updates)
  }

  private getParticipants() {
    return this.db.object('users-ids').valueChanges().take(1).map((users) => {
      const newParticipants = {};
      Object.keys(users).forEach(userKey => {
        newParticipants[userKey] = {
          name: users[userKey].name,
          amount: 0,
          status: 'initial',
        }
      });
      return newParticipants;
    });
  }

  public getEventOrderDetails(eventKey) {
    return this.db.object(`events/${eventKey}/order`).valueChanges().take(1);
  }

  public getEventParticipants(eventKey, all): Observable<Participant[]> {
    return this.db.list(`events/${eventKey}/participants`).snapshotChanges().map((snaps) => {
      return snaps.map(snap => {
        const value = snap.payload.val();
        value.key = snap.key;
        return <Participant>value;
      })
    }).map((participants: Participant[]) => {
      if (all) {
        return participants;
      }
      return participants.filter(participant => participant.status !== 'initial');
    });
  }

  getEventDetails(eventKey): Observable<Event> {
    return <Observable<Event>>this.db.object(`events/${eventKey}`).valueChanges();
  }

  getAdminEvents(uid): Observable<Event[]> {
    return this.db.list(`users/${uid}/adminEvents`).snapshotChanges().map((snaps) => {
      return snaps.map(snap => {
        const value = snap.payload.val();
        value.key = snap.key;
        return <Event>value;
      })
    });
  }

  getAdminEventsInitial(uid) {
    return this.db.object(`users/${uid}/adminEvents`).valueChanges().subscribe(item => console.log(`item`, item));
  }

  getUserParticipants(uid) {
    return this.db.list(`users/${uid}/participants`).snapshotChanges().map((snaps) => {
      return snaps.map(snap => {
        const value = snap.payload.val();
        value.key = snap.key;
        return value;
      })
    }).map((participants) => {
      return _.orderBy(participants, (participant) => {
        return new Date(participant.eventDueDate).getTime();
      }, 'desc');
    });
  }

  deleteEvent(event) {
    const eventKey = event.key;
    console.log('event to delete ', eventKey);
    return new Promise((resolve, reject) => {
      return this.db.object('users-ids').valueChanges().take(1).subscribe(usersIds => {
        const updates = {};
        Object.keys(usersIds).forEach(userId => {
          updates[`users/${userId}/adminEvents/${eventKey}`] = null;
          updates[`users/${userId}/participants/${eventKey}`] = null;
          updates[`events/${eventKey}`] = null;
          updates[`events-ids/${eventKey}`] = null;
        })
        return this.db.object('/').update(updates).then((result)=>resolve()).catch((error)=>reject(error));
      }, (error)=>{
        console.error(error);
        console.log('errorn getting user ids')
      })
    })
  }

  saveParticipant(participant, uid) {
    const updates = {};
    updates[`users/${uid}/participants/${participant.key}`] = participant;
    updates[`events/${participant.key}/participants/${uid}`] = participant;
    return this.db.object('/').update(updates);
  }

  saveParticipantStatus(userKey, eventKey, status, total) {
    const updates = {};
    updates[`users/${userKey}/participants/${eventKey}/status`] = status;
    updates[`events/${eventKey}/participants/${userKey}/status`] = status;
    if (status === 'paid') {
      updates[`users/${userKey}/participants/${eventKey}/paid`] = total;
      updates[`events/${eventKey}/participants/${userKey}/paid`] = total;
      updates[`users/${userKey}/participants/${eventKey}/toPay`] = 0;
      updates[`events/${eventKey}/participants/${userKey}/toPay`] = 0;
    }
    return this.db.object('/').update(updates);
  }

  saveAdmin(eventData, userKey) {
    const updates = {};
    updates[`users/${userKey}/adminEvents/${eventData.key}`] = {
      duedate: eventData.duedate,
      name: eventData.name,
    }
    return this.db.object('/').update(updates);
  }

}
