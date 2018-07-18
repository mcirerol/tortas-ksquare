import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, ToastController, AlertController, ItemSliding } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { NewEventPage } from '../new-event/new-event';
import { EventProvider } from '../../providers/event/event';
import { Observable } from 'rxjs/Observable';
import { UserProvider } from '../../providers/user/user';
import { Event } from '../../shared/event';
import { EventDetailPage } from '../event-detail/event-detail';
import { NotificationProvider } from '../../providers/notification/notification';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {
  manageEvents: Observable<Event[]>;
  constructor(public navCtrl: NavController,
    private eventService: EventProvider, private modalCtrl: ModalController,
    private notificationService: NotificationProvider,
     private userService: UserProvider, private toastCtrl: ToastController, private alertCtrl: AlertController) {

  }

  openNewEvent() {
    const modal = this.modalCtrl.create(NewEventPage);
    modal.present();
    modal.onDidDismiss((event) => {
      if (event != null) {
        this.eventService.saveEvent(event).then((eventKey) => {
          console.log('event to save, ', event);
          this.notifyNewEvent(event, eventKey);
          this.toastCtrl.create({ message: `event created succesfully`, duration: 2000 }).present();
        }, error => { console.error(`error can't save event: `, error) })
      }
    })
  }

  private notifyNewEvent(event, eventKey){
    this.notificationService.subscribeDevicesToNewEvent(eventKey).then(()=>{
      console.log('sending notification');
      this.notificationService.notify(eventKey, 'off', `A new event has been created!!. You can place orders now for ${event.name}`);
    })

  }

  ngOnInit() {
    const uid = this.userService.getCurrentUserState().uid;
    this.manageEvents = this.eventService.getAdminEvents(uid);
    this.manageEvents.subscribe(value => {
      console.log('value subscribed', value);
    })
    this.eventService.getAdminEventsInitial(uid);
  }

  goEventDetails(event) {
    console.log('event key', event.key);
    this.navCtrl.push(EventDetailPage, { eventKey: event.key })
  }

  deleteEvent(item: ItemSliding, event) {
    console.log(event);
    const alert = this.alertCtrl.create({
      message: 'Do you want to delete this event?',
      title: 'Confirm Delete',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Delete',
          handler: () => {
            const toast = this.toastCtrl.create({
              message: `Event deleted succesfully`,
              duration: 2000
            })

            this.eventService.deleteEvent(event).then(() => {
              toast.present();
            }, error => { console.error(`error can't save event: `, error) })
          }
        }
      ]
    });
    alert.present();
    item.close();

  }

  notify(){
    this.notificationService.notify('-LHW7TLIB7Sk5UMY4BjD', 'off', 'hey paguen sus tortas mal pedos');
  }

}
