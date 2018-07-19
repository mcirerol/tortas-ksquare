import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { UserProvider } from '../user/user';

/*
  Generated class for the NotificationProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class NotificationProvider {

  constructor(public http: HttpClient, private userService: UserProvider, @Inject('config') private config: any) {
    console.log('Hello NotificationProvider Provider');
  }

  notify(event, type, body) {
    return this.getIdToken().then(this.doNotify.bind(this, event, type, body)).catch(error => {
      console.log('error');
      console.log(error);
    })
  }

  doNotify(event, type, bodyMessage, idToken) {
    const body = {
      topic: `${event}-${type}`,
      body: bodyMessage,
    };
    console.log(idToken);
    const query = new HttpParams().set('idToken', idToken);
    return this.http.post(this.config.host + '/devices/notifications', body, { params: query }).toPromise().then((response: HttpResponse<any>) => {
      console.log('response');
      console.log(response);
    });
  }


  public subscribeDevice(deviceToken) {
    const doSubcribe = (idToken) => {
      const query = new HttpParams().set('idToken', idToken);
      const body = {
        deviceToken,
      };
      return this.http.post(this.config.host + '/events/subscriptions', body, { params: query }).toPromise().then((response: HttpResponse<any>) => {
        console.log('response');
        console.log(response);
      });
    }
    return this.userService.getCurrentUserState().getIdToken().then(idToken => {
      return doSubcribe(idToken);
    });
  }

  subscribeDevicesToNewEvent(eventKey) {
    const doSubcribe = (idToken) => {
      const query = new HttpParams().set('idToken', idToken);
      const body = {
        eventKey,
      };
      return this.http.post(this.config.host + '/devices/subscriptions', body, { params: query }).toPromise().then((response: HttpResponse<any>) => {
        console.log('response');
        console.log(response);
      })
    }
    return this.userService.getCurrentUserState().getIdToken().then(idToken => {
      return doSubcribe(idToken);
    });
  }

  private getIdToken() {
    return this.userService.getCurrentUserState().getIdToken();
  }

  subscribeToEventOff(eventKey) {
    return this.updateSubscription(`${eventKey}-off`, `${eventKey}-on`);
  }

  subscribeToEventOn(eventKey) {
    return this.updateSubscription(`${eventKey}-on`, `${eventKey}-off`);
  }

  private updateSubscription(toSubscribe, tuUnsubscribe) {
    const doUpdate = (idToken) => {
      const query = new HttpParams().set('idToken', idToken);
      const body = {
        toSubscribe,
        tuUnsubscribe
      };
      return this.http.put(this.config.host + '/users/subscriptions', body, { params: query }).toPromise().then((response: HttpResponse<any>) => {
        console.log('response');
        console.log(response);
      });
    }
    return this.getIdToken().then((idToken) => doUpdate(idToken));
  }

}
