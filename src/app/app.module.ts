import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { AngularFireModule } from 'angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { firebaseConfig } from '../environment-prod'; //Change when going to prod
import {IonicStorageModule} from '@ionic/storage';

import { AboutPage } from '../pages/about/about';
import { ContactPage } from '../pages/contact/contact';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { EventDetailPage } from '../pages/event-detail/event-detail';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { LoginPage } from '../pages/login/login';
import { UserProvider } from '../providers/user/user';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { NewEventPage } from '../pages/new-event/new-event';
import { EventProvider } from '../providers/event/event';
import { ParticipantEditPage } from '../pages/participant-edit/participant-edit';
import { LoginPageModule } from '../pages/login/login.module';
import { NewEventPageModule } from '../pages/new-event/new-event.module';
import { ParticipantEditPageModule } from '../pages/participant-edit/participant-edit.module';
import { EventDetailModule } from '../pages/event-detail/event-detail.module';
import { OrderDetailPageModule } from '../pages/order-detail/order-detail.module';
import { FonditaOrderEditPageModule } from '../pages/fondita-order-edit/fondita-order-edit.module';

@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    // LoginPage,
    // NewEventPage,
    // EventDetailPage,
    // ParticipantEditPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    IonicStorageModule.forRoot(),
    LoginPageModule,
    NewEventPageModule,
    EventDetailModule,
    ParticipantEditPageModule,
    OrderDetailPageModule,
    FonditaOrderEditPageModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    ContactPage,
    HomePage,
    TabsPage,
    LoginPage,
    NewEventPage,
    EventDetailPage,
    ParticipantEditPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    UserProvider,
    EventProvider,
    {
      useValue: firebaseConfig, provide: 'config'
    },
  ]
})
export class AppModule {}
