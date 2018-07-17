import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, AlertController, Alert, ToastController, LoadingController } from 'ionic-angular';
import { Participant } from '../../shared/participant';
import { Event } from '../../shared/event';
import { AngularFireDatabase } from 'angularfire2/database'
import { EventProvider } from '../../providers/event/event';
import { Observable } from 'rxjs/Observable';
import { OrderDetailPage } from '../order-detail/order-detail';

/**
 * Generated class for the EventDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-event-detail',
  templateUrl: 'event-detail.html',
})
export class EventDetailPage implements OnInit {
  event: Observable<Event>;
  participantsOriginal: Observable<Participant[]>;
  participantsSearch: Observable<Participant[]>;
  eventKey;
  actualEvent: Event;
  total: number;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private eventService: EventProvider, private action: ActionSheetController,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController, private toastCtrl: ToastController) {
    this.eventKey = navParams.get('eventKey');
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EventDetailPage');
  }

  ngOnInit() {
    console.log('event key ', this.eventKey);
    this.participantsOriginal = this.eventService.getEventParticipants(this.eventKey, false);
    this.participantsSearch = this.participantsOriginal.map(item => item);
    this.participantsOriginal.subscribe(participants => this.calculateTotals(participants));
    this.event = this.eventService.getEventDetails(this.eventKey);
    this.event.subscribe(event =>
      this.actualEvent = event);
  }

  calculateTotals(participants) {
    this.total = participants.reduce((total, item) => total + item.total * 1, 0);
  }

  getItems(event) {
    console.log(event, 'event');
    const value = event.srcElement.value;
    console.log(value, 'value to search');
    this.participantsSearch = this.participantsOriginal.map(participants => {
      const participantsOnSearch = participants.filter((participant) => {
        if (value == null || value.trim() === '') {
          return true;
        } else {
          if (participant.name && participant.name.toLowerCase().indexOf(value.toLowerCase()) != -1) {
            return true;
          }
        }
      });
      console.log('participants on search', participantsOnSearch);
      return participantsOnSearch;
    })
  }

  openSelectAdmins() {
    const alert = this.alertCtrl.create();
    this.eventService.getEventParticipants(this.eventKey, true).subscribe(participants => {
      participants.forEach((participant) => {
        alert.addInput({
          type: 'radio',
          label: participant.name,
          value: participant.key,
        })
      })
      alert.addButton('Cancel');
      alert.addButton({
        text: 'Select',
        handler: (data: any) => {
          console.log('Radio data:', data);
          this.saveAdmin(data);
        }
      });
      alert.setTitle('Select New Admin');
      alert.present();
    })
  }

  saveAdmin(userKey) {

    console.log('event subscribed');
    this.actualEvent.key = this.eventKey;
    this.eventService.saveAdmin(this.actualEvent, userKey).then(() => {
      this.toastCtrl.create({
        message: 'Admin added succesfully',
        duration: 2500
      }).present();
    }).catch(error => {
      this.toastCtrl.create({
        message: 'Error Ocurred added admins',
        duration: 2500
      }).present();
      console.error(error);
    })

  }

  openSetStatus(participant) {
    const alert = this.alertCtrl.create({
      title: 'Select Status',
      buttons: [
        {
          text: 'cancel',
          role: 'cancel'
        },
        {
          text: 'Select',
          handler: (status) => {
            if (status) {
              this.updateStatus(status, participant);
            }
          }
        }


      ]
    });
    alert.addInput(
      {
        type: 'radio',
        label: 'paid',
        value: 'paid',
        checked: participant.status === 'paid'
      });
    alert.addInput(
      {
        type: 'radio',
        label: 'delivered',
        value: 'delivered',
        checked: participant.status === 'delivered'
      })
      alert.present();
  }

  updateStatus(status, participant) {
    this.eventService.saveParticipantStatus(participant.userKey, this.eventKey, status, participant.total)
      .then(() => {
        this.toastCtrl.create({
          message: 'Changed status succesfully',
          duration: 2500
        }).present();
      }).catch(error => {
        this.toastCtrl.create({
          message: 'Error Ocurred changing status',
          duration: 2500
        }).present();
        console.error(error);
      })
  }

  openActionSheet() {
    this.action.create({
      title: 'Actions',
      buttons: [
        {
          text: `Add admins`,
          handler: () => { this.openSelectAdmins() }
        },
        // {
        //   text: `Copy to clipboard`,
        //   handler: () => { this.copyShort() }
        // },
        {
          text: `Cancel`,
          role: `cancel`
        },
      ]
    }).present();
  }

  // copyShort() {
  //   let text = '';
  //   console.log('are you on x2');
  //   this.participantsOriginal.take(1).subscribe((participants) => {
  //     const participantsCopy: any = <any>participants;
  //     console.log('are you on');
  //     participantsCopy.forEach((participant) => {
  //       text += `
  //       ${participant.name}
  //       Status: ${participant.status}
  //       Order: Poc Chuc ${participant.pochuc}, Camarón: ${participant.shrimp}
  //       Total: ${participant.total}, Balance: ${participant.toPay}
  //       --------------------------------------------------------`;
  //     })
  //     this.calculateTotals(participants);
  //     text += `
  //     Total camaron: ${this.totalShrimp}. Total poc-chuc: ${this.totalPocchuc}
  //     Total a Pagar: ${this.total}
  //     `;
  //     const el = document.createElement('textarea');
  //     el.value = text;
  //     document.body.appendChild(el);
  //     el.select();
  //     document.execCommand('copy');
  //     document.body.removeChild(el);
  //     this.toastCtrl.create({ message: 'copied to clipboard', duration: 1000 }).present();
  //   })
  // }

  openOrderDetail() {
    const loading = this.loadingCtrl.create();
    loading.present();
    this.eventService.getEventOrderDetails(this.eventKey).subscribe((eventOrder) => {
      loading.dismiss();
      this.navCtrl.push(OrderDetailPage, { eventOrder, participants: this.participantsOriginal });
    }, (err) => {
      console.error(err);
      console.log('error ocurred');
      loading.dismiss();
    })
  }

}
