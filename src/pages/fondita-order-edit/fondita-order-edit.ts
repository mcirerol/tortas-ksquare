import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ToastController, AlertController } from 'ionic-angular';
import { FormBuilder, Validators, FormGroup, AbstractControl, FormArray, FormControl } from '@angular/forms';
import { UserProvider } from '../../providers/user/user';
import moment from 'moment';
/**
 * Generated class for the ParticipantEditPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'fondita-order-edit',
  templateUrl: 'fondita-order-edit.html',
})
export class FonditaOrderEditPage {
  orderForm: FormGroup;
  participant: any;
  initPaid: number;
  eventOrder: any;
  items: any[] = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, private alertCtrl: AlertController,
    private viewCtrl: ViewController, private formBuilder: FormBuilder
    , private userService: UserProvider, private toastCtrl: ToastController) {
    this.participant = Object.assign({}, navParams.get('participant'));
    this.eventOrder = Object.assign({}, navParams.get('eventOrder'));
    console.log('participant', this.participant)
    this.items = this.getItems();
    this.initPaid = this.participant.paid || 0;
    this.orderForm = this.formBuilder.group({
      complements: [this.participant.complements, this.maxSelect(this.eventOrder.maxCom)],
      price: this.getSelectedPrice(),
      selectedIndex: [this.getSelectedIndex(), Validators.min(0)],
    });
    this.orderForm.setValidators([this.selectFood()]);
  }

  maxSelect(max: number) {
    return (control: FormControl): { [key: string]: boolean } => {
      const array = control.value;
      console.log('array', 'whats athat', array)
      if (array && array.length > max) {
        console.log('this not good');
        return { limit: true }
      }
      return null;
    }
  }

  selectFood() {
    return (control: AbstractControl): { [key: string]: boolean } => {
      console.log('this chicken');
      const complements = control.get('complements').value;
      const selectedIndex = control.get('selectedIndex').value;
      if (complements && complements.length > 0 && selectedIndex < 0) {
        return { selectFood: true };
      }
      return null;
    }
  }
  cancel() {
    const alert = this.alertCtrl.create({
      message: 'Are you sure you want to cancel the order?',
      title: 'Confirm Cancel',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
        },
        {
          text: 'Yes, cancel',
          handler: () => {
            this.makeCancel();
          }
        }
      ]
    });
    alert.present();
  }

  makeCancel() {
    this.orderForm.get('selectedIndex').setValue(-1);
    this.orderForm.get('complements').setValue([]);
    this.orderForm.get('price').setValue(null);
    this.submit(this.getCancelStatus());
  }

  getCancelStatus() {
    if (this.participant.status === 'initial') {
      return 'initial';
    }
    if (this.participant.status === 'paid' || this.participant.status === 'delivered') {
      return 'canceled';
    }
    return 'created';
  }


  getSelectedPrice() {
    return this.participant.priceIndexSelected != null ? this.participant.priceIndexSelected : 0;
  }

  getSelectedIndex() {
    if (this.participant.order != null) {
      const itemOrdered = Object.keys(this.participant.order)[0];
      console.log('item ordered ', itemOrdered);
      console.log('index', (parseInt(itemOrdered) - this.participant.priceIndexSelected) / this.eventOrder.prices.length);
      return (parseInt(itemOrdered) - this.participant.priceIndexSelected) / this.eventOrder.prices.length;
    } else {
      return -1;
    }
  }

  getItems() {
    const newItems = [];
    const length = this.eventOrder.items.length / this.eventOrder.prices.length;
    console.log('length items ', length);
    for (let i = 0; i < length; i++) {
      console.log('items i ', i * (this.eventOrder.prices.length));
      newItems.push(this.eventOrder.items[i * (this.eventOrder.prices.length)]);
    }
    console.log(newItems)
    return newItems;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ParticipantEditPage');
  }

  getParticipantOrder() {
    const participantOrder = {};
    const index = this.orderForm.get('selectedIndex').value;
    console.log(this.participant.priceIndexSelected, index);
    if (index > -1) {
      participantOrder[(index * this.eventOrder.prices.length) + this.participant.priceIndexSelected] = 1;
    }
    return participantOrder;
  }

  getOrderString() {
    let orderString: string = '';
    if (this.participant.order != null) {
      const orderKeys = Object.keys(this.participant.order);
      orderString = orderKeys.reduce((acc, element, index) => {
        return `${acc}${index > 0 ? ', ' : ''}${this.participant.order[element]} ${this.eventOrder.items[element].name} ${this.eventOrder.items[element].priceName != null ? this.eventOrder.items[element].priceName : ''}`;
      }, '') + '';
    }
    console.log('order string ', orderString);
    return orderString;
  }

  getComplementsString() {
    const complements = this.orderForm.get('complements').value;
    if (complements != null) {
      return complements.reduce((acc, complement, index) => {
        return `${acc}${index > 0 ? ', ' : ''}${this.eventOrder.complements[complement]}`;
      }, '')
    } else {
      return '';
    }

  }


  submit(status) {
    const now = moment();
    const dueDate = moment(this.participant.eventDueDate);
    if (now.isAfter(dueDate)) {
      return this.toastCtrl.create({ message: `Order has expired, can't be edited`, duration: 1100 }).present();
    }
    // this.participant.shrimp = this.orderForm.get('shrimp').value;
    // this.participant.pochuc = this.orderForm.get('pochuc').value;
    this.participant.name = this.userService.getCurrentUserState().displayName;

    this.participant.status = status || 'created';
    this.participant.priceIndexSelected = this.orderForm.get('price').value;
    if (this.participant.priceIndexSelected == null) {
      this.participant.total = 0;
    } else {
      this.participant.total = this.eventOrder.prices[this.participant.priceIndexSelected].price;
    }
    this.participant.toPay = (this.initPaid - this.participant.total) * - 1;
    this.participant.order = this.getParticipantOrder();
    this.participant.orderString = this.getOrderString();
    this.participant.complements = this.orderForm.get('complements').value;
    this.participant.complementsString = this.getComplementsString();
    this.viewCtrl.dismiss(this.participant);
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  updateTotal(form) {
    console.log(form);
    // const total = form.reduce((total, item, index) => {
    //   let itemTotal = 0;
    //   if (item) {
    //     itemTotal = parseInt(item) * parseFloat(this.eventOrder.items[index].price);
    //   }
    //   return total + itemTotal;
    // }, 0);
    // this.participant.total = total;
    // console.log('update total bro', form);
  }

}
