import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, ToastController, AlertController, LoadingController } from 'ionic-angular';
import { EventProvider } from '../../providers/event/event';
import { UserProvider } from '../../providers/user/user';
import { ParticipantEditPage } from '../participant-edit/participant-edit';
import moment from 'moment';
import { FonditaOrderEditPage } from '../fondita-order-edit/fondita-order-edit';
import { NotificationProvider } from '../../providers/notification/notification';

@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage implements OnInit {
  participants: any;
  show: string = 'current';
  currentParticipants: any;
  expiredParticipants: any;

  constructor(public navCtrl: NavController, private eventService: EventProvider,
    private userService: UserProvider,
    private alertCtrl: AlertController,
    private loadingCtrl: LoadingController,
    private notificationService: NotificationProvider,
    private modalCtrl: ModalController, private toastCtrl: ToastController) {

  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    const uid = this.userService.getCurrentUserState().uid;
    this.participants = this.eventService.getUserParticipants(uid).map(pariticipantsArg => {
      return pariticipantsArg.map((participant) => {
        const now = moment();
        const dueDate = moment(participant.eventDueDate);
        if (now.isAfter(dueDate)) {
          participant.status = 'expired';
        }
        return participant;
      });
    });
    this.currentParticipants = this.participants.map((participants) => {
      return participants.filter((participant) => {
        return participant.status !== 'expired';
      })
    });

    this.expiredParticipants = this.participants.map((participants) => {
      return participants.filter((participant) => {
        return participant.status === 'expired';
      })
    });
  }

  openEditParticipant(participant) {
    const now = moment();
    const dueDate = moment(participant.eventDueDate);
    if (participant.status === 'expired') {
      return this.toastCtrl.create({ message: `Order has expired, can't be edited`, duration: 1100 }).present();
    } else if (now.isAfter(dueDate)) {
      this.loadUsers();
      return this.toastCtrl.create({ message: `Order has expired, can't be edited`, duration: 1100 }).present();
    } else if (participant.status === 'paid') {

      const alert = this.alertCtrl.create({
        message: 'Order is already paid, are you sure you want to edit it?',
        title: 'Confirm Edit',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
          },
          {
            text: 'Edit',
            handler: () => {
              this.goEditParticipant(participant);
            }
          }
        ]
      });
      alert.present();
    } else {
      this.goEditParticipant(participant);
    }

  }

  goEditParticipant(participant) {
    console.log('particpnat on open', participant);
    const loading = this.loadingCtrl.create();
    loading.present();
    this.eventService.getEventOrderDetails(participant.eventKey).subscribe((eventOrder) => {
      console.log('event order ', eventOrder);
      loading.dismiss();
      const page = participant.fondita ? FonditaOrderEditPage : ParticipantEditPage;
      const modal = this.modalCtrl.create(page, { participant: participant, eventOrder });
      modal.present();
      modal.onDidDismiss((data) => {
        if (data) {
          this.saveParticipant(data);
        }
      })
    }, (error) => {
      loading.dismiss();
      console.error(error);
      this.toastCtrl.create({ message: 'an error ocurred, please tr ¡y again', duration: 1500 }).present();
    })

  }

  saveParticipant(participant) {
    const uid = this.userService.getCurrentUserState().uid;
    this.eventService.saveParticipant(participant, uid).then((participantSaved) => {
      this.toastCtrl.create({
        message: 'Order saved successfully',
        duration: 2000
      }).present();
      if (participantSaved.total > 0) {
        this.notificationService.subscribeToEventOn(participantSaved.eventKey);
      } else {
        this.notificationService.subscribeToEventOff(participantSaved.eventKey);
      }
    }, (error) => {
      this.toastCtrl.create({
        message: 'An error ocurred creating the order',
        duration: 2000
      }).present();
      console.error(error);
    });
  }

}
