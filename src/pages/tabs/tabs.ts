import { Component, Inject, OnInit } from '@angular/core';

import { AboutPage } from '../about/about';
import { ContactPage } from '../contact/contact';
import { HomePage } from '../home/home';
import firebase from 'firebase';


@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage implements OnInit {

  tab1Root = HomePage;
  tab2Root = AboutPage;
  tab3Root = ContactPage;
  messaging: firebase.messaging.Messaging;

  constructor(@Inject('config') private config: any) {
    this.messaging = firebase.messaging();
    console.log(`config: `, this.config);

    //this.messaging.useServiceWorker(serviceWorkerRegistration);
    //const messagingMock: any = <any>firebase.messaging;
    

  }

  ngOnInit() {
    // navigator.serviceWorker.getRegistration().then((serviceWorker) => {
    //   this.messaging.useServiceWorker(serviceWorker);
    //   // this.requestToken();
    // })
  }

  requestToken() {
    this.messaging.requestPermission().then(() => {
      console.log('permission granted');
      return this.messaging.getToken();
    })
      .then(token => console.log(`token ${token}`))
      .then(()=> this.messaging.usePublicVapidKey(this.config.certificatePair))
      .then(()=>this.registerMessage())
      .catch(error => console.error(error));
  }

  registerMessage(){
    console.log('im here');
    this.messaging.onMessage(()=>{
      console.log('hello, can you hear me?')
    })
  }

}
