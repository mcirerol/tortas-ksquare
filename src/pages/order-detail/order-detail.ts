import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { Observable } from 'rxjs';
import _ from 'lodash';

/**
 * Generated class for the OrderDetailPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-order-detail',
  templateUrl: 'order-detail.html',
})
export class OrderDetailPage {
  eventOrder;
  items;

  constructor(public navCtrl: NavController, public navParams: NavParams, private toastCtrl: ToastController) {
    const participants: Observable<any> = this.navParams.get('participants');
    participants.subscribe((participants) => this.getText(participants))
    this.eventOrder = this.navParams.get('eventOrder');
  }

  getText(participants: any[]) {
    console.log('participants obtained', participants);
    const data = this.normalizeData(participants);
    this.items = this.flatData(data);
  }

  flatData(data) {
    const array = [];
    data.forEach((item, index) => {
      const complementKeys = Object.keys(item);
      complementKeys.forEach((complementKey) => {
        array.push({
          id: index,
          quantity: item[complementKey].quantity,
          complements: item[complementKey].complements,
        })
      })
    })
    return array;
  }

  normalizeData(participants) {
    console.log('event order', this.eventOrder);
    return this.eventOrder.items.map((orderItem, index) => {
      return participants.filter((participant) => participant.order && participant.order[index] != null && participant.order[index] > 0)
        .map((participant) => ({ quantity: participant.order[index], complements: participant.complements }))
        .reduce((acc, data, index, all) => {
          let hash = 'nocomplements';
          const hasComplements = data.complements;
          console.log('hascomplemnents', hasComplements);
          if (data.complements != null) {
            hash = data.complements.reduce((acc, complement) => `${acc}${complement}`, '') || 'nocomplements';
          }
          if (acc[hash] == null) {
            acc[hash] = {
              complements: data.complements,
              quantity: parseInt(data.quantity),
            };
          } else {
            acc[hash].quantity += parseInt(data.quantity);
          }
          return acc;
        }, {});
    })
  }


  ionViewDidLoad() {
    console.log('ionViewDidLoad OrderDetailPage');
  }

  copyShort() {
    let text = '';
    console.log('are you on x2');
    if (this.items != null) {
      this.items.forEach((item) => {
        text+=`
${item.quantity} ${this.eventOrder.items[item.id].priceName || ''} ${this.eventOrder.items[item.id].name} ${item.complements ? `con ${item.complements.map(complement => this.eventOrder.complements[complement]).join(', ')}` : ''}`;
      })
    }
    text = text.trim();
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    this.toastCtrl.create({ message: 'copied to clipboard', duration: 1000 }).present();
}

}
