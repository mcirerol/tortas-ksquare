import { Component, Inject, OnInit } from '@angular/core';

import { AboutPage } from '../about/about';
import { ContactPage } from '../contact/contact';
import { HomePage } from '../home/home';
import firebase from 'firebase';
import { EventProvider } from '../../providers/event/event';
import { FCM } from '@ionic-native/fcm';
import { Platform, ToastController } from 'ionic-angular';
import { duration } from '../../../node_modules/moment';


@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage implements OnInit {

  tab1Root = HomePage;
  tab2Root = AboutPage;
  tab3Root = ContactPage;
  messaging: firebase.messaging.Messaging;

  constructor(@Inject('config') private config: any, private toastCtrl: ToastController, private eventService: EventProvider, private fcm: FCM, private platform: Platform) {
    this.messaging = firebase.messaging();
    console.log(`config: `, this.config);

    //this.messaging.useServiceWorker(serviceWorkerRegistration);
    //const messagingMock: any = <any>firebase.messaging;


  }

  ngOnInit() {
    this.startDeviceNotificationService();
  }

  requestToken() {
    this.messaging.usePublicVapidKey(this.config.certificatePair);
    this.messaging.requestPermission().then(() => {
      console.log('permission granted');
      return this.messaging.getToken();
    })
      .then(token => { console.log('token', token); this.eventService.saveDevice(token) })
      //.then(() => this.messaging.usePublicVapidKey(this.config.certificatePair))
      .then(() => this.registerMessage())
      .catch(error => console.error(error));
  }

  registerMessage() {
    console.log('im here');
    this.messaging.onMessage(((message: any) => {
      console.log('hello, can you hear me?');
      console.log(message);
      const not = new Notification('Tortas APP!', { body: message.notification.body, icon: '/assets/imgs/logo.png' });
    }));
  }

  startDeviceNotificationService() {
    console.log('start process');
    if (this.platform.is('cordova')) {
      this.startCordova();
    } else {
      this.startWeb();
    }
  }

  startWeb() {
    try {
      console.log('start web');
      navigator.serviceWorker.getRegistration().then((serviceWorker) => {
        this.messaging.useServiceWorker(serviceWorker);
        return this.requestToken();
      })
    }
    catch (e) {
      console.log('error ocurred tryng to register service worker, probably api not available');
      console.error(e);
    }

  }

  startCordova() {
    console.log('start cordova');
    this.fcm.getToken().then(token => {
      console.log('token');
      console.log(token);
      this.eventService.saveDevice(token);
    }).catch(error => {
      console.log('error getting token and saving device');
      console.error(error);
    });

    this.fcm.onNotification().subscribe(data => {
      console.log('data');
      console.log(data);
      this.toastCtrl.create({ message: data.body, duration: 3000, position: 'middle' }).present();;
      if (data.wasTapped) {
        console.log("Received in background");
      } else {
        console.log("Received in foreground");
      };
    });

  }

}
