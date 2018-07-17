import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ToastController, AlertController } from 'ionic-angular';
import { FormBuilder, Validators, FormGroup, AbstractControl, FormArray } from '@angular/forms';
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
  selector: 'page-participant-edit',
  templateUrl: 'participant-edit.html',
})
export class ParticipantEditPage {
  orderForm: FormGroup;
  participant: any;
  initPaid: number;
  eventOrder: any;

  constructor(public navCtrl: NavController, public navParams: NavParams,
    private alertCtrl: AlertController,
    private viewCtrl: ViewController, private formBuilder: FormBuilder
    , private userService: UserProvider, private toastCtrl: ToastController) {
    this.participant = Object.assign({}, navParams.get('participant'));
    this.eventOrder = Object.assign({}, navParams.get('eventOrder'));
    console.log('participant', this.participant)
    this.initPaid = this.participant.paid || 0;
    this.orderForm = this.formBuilder.group({
      complements: [this.participant.complements],
      // pochuc: [this.participant.pochuc || 0, [Validators.required, Validators.max(100), Validators.min(0), Validators.pattern('^[0-9]{0,2}$')]],
      // shrimp: [this.participant.shrimp || 0, [Validators.required, Validators.max(100), Validators.min(0), Validators.pattern('^[0-9]{0,2}$')]],
      items: this.formBuilder.array(this.createItemsForm()),
    });
    this.orderForm.setValidators(this.forbiddenZero());
    this.orderForm.get('items').valueChanges.subscribe(this.updateTotal.bind(this));
    //this.orderForm.get('items').valueChanges.subscribe(this.getValues.bind(this));
  }

  createItemsForm(): any[] {
    const orderParticipant = this.participant.order || [];
    return this.eventOrder.items.map((item, index) => {
      return this.formBuilder.control(orderParticipant[index] || 0, [Validators.required, Validators.max(100), Validators.min(0), Validators.pattern('^[0-9]{0,2}$')]);
    })
  }

  forbiddenZero() {
    return (control: AbstractControl): { [key: string]: boolean } => {
      const every = this.eventOrder.items.every((item, index) => {
        return parseInt(this.orderForm.get(`items.${index}`).value) === 0;
      })
      if (every) {
        return { noEmpty: true }
      }
      return null;
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ParticipantEditPage');
  }

  // resetIfZero(controlName) {
  //   const value = String(this.orderForm.get(controlName).value);
  //   console.log('value', value);
  //   if (value === '0') {
  //     this.orderForm.get(controlName).setValue('')
  //   }
  // }

  getParticipantOrder() {
    const participantOrder = {};
    this.eventOrder.items.forEach((item, index) => {
      console.log('inde', index);
      const value = this.orderForm.get(`items.${index}`).value;
      if (value > 0) {
        participantOrder[index] = parseInt(value);
      }
    });
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

  increment(i) {
    const newValue = this.orderForm.get('items.' + i).value + 1;
    this.orderForm.get('items.' + i).setValue(newValue);
  }

  decrement(i) {
    const newValue = this.orderForm.get('items.' + i).value + -1;
    if (newValue < 0) {
      return;
    }
    this.orderForm.get('items.' + i).setValue(newValue);
  }

  getValues() {
    console.log('complments', this.orderForm.get('complements').value);
    this.participant.order = this.getParticipantOrder();
    console.log('order object ', this.participant.order);
    this.getOrderString();
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
    this.participant.toPay = (this.initPaid - this.participant.total) * - 1;
    this.participant.status = status || 'created';
    this.participant.order = this.getParticipantOrder();
    this.participant.orderString = this.getOrderString();
    this.participant.complements = this.orderForm.get('complements').value;
    this.participant.complementsString = this.getComplementsString();
    this.viewCtrl.dismiss(this.participant);
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
    this.eventOrder.items.forEach((item, index) => {
      this.orderForm.get(`items.${index}`).setValue(0);
    })
    this.participant.total = 0;
    this.submit(this.getCancelStatus());
  }


  dismiss() {
    this.viewCtrl.dismiss();
  }

  updateTotal(form) {
    const total = form.reduce((total, item, index) => {
      let itemTotal = 0;
      if (item) {
        itemTotal = parseInt(item) * parseFloat(this.eventOrder.items[index].price);
      }
      return total + itemTotal;
    }, 0);
    this.participant.total = total;
    console.log('update total bro', form);
  }

}
