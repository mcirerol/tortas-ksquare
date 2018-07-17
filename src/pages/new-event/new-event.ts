import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController, ToastController } from 'ionic-angular';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Event } from '../../shared/event';
import { Observable } from 'rxjs';

/**
 * Generated class for the NewEventPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-new-event',
  templateUrl: 'new-event.html',
})
export class NewEventPage {
  eventForm: FormGroup;
  event: Event;
  fondita: boolean = true;
  valuePrices = `Media, 45
Completa, 55`;
  valueItemsFree = `Torta Poc Chuc, 22\nTorta Camarón, 25`;
  itemPricePattern = /^[^\S\r\n]*[a-zA-Z]{2,}[^,\r\n]+\,[^\S\r\n]*\d{1,4}((\.\d{0,2})|\.?)[^\S\r\n]*([\S\r\n][a-zA-Z]{2,}[^,\r\n]+\,[^\S\r\n]*\d{1,4}((\.\d{0,2})|\.?)[^\S\r\n]*)*\s*$/i;
  maxCom;
  constructor(public navCtrl: NavController, public navParams: NavParams, private viewCtrl: ViewController, private formBuilder: FormBuilder, private ToastCtrl: ToastController) {
    this.eventForm = this.formBuilder.group({
      name: ['', Validators.required],
      duedate: ['', Validators.required],
      prices: [this.valuePrices, [Validators.required, Validators.pattern(this.itemPricePattern)]],
      itemsFree: [this.valueItemsFree],
      items: ['', Validators.required],
      fondita: this.fondita,
      complements: [''],
      maxCom: [null],
      password: ['', Validators.required]
    });
    // this.eventForm.get('maxCom').disable();
    this.eventForm.valueChanges.subscribe((form) => {
      if (this.fondita !== form.fondita) {
        this.fondita = form.fondita;
        if (form.fondita) {
          console.log('fondita mode, adding validators ')
          this.eventForm.get('prices').setValidators([Validators.required, Validators.pattern(this.itemPricePattern)]);
          this.eventForm.get('prices').updateValueAndValidity();
          this.eventForm.get('items').setValidators(Validators.required);
          this.eventForm.get('items').updateValueAndValidity();
          this.eventForm.get('itemsFree').clearValidators();
          this.eventForm.get('itemsFree').updateValueAndValidity();
        } else {
          console.log('fondita mode, removing validators ')
          this.eventForm.get('prices').clearValidators();
          this.eventForm.get('prices').updateValueAndValidity();
          this.eventForm.get('items').clearValidators();
          this.eventForm.get('items').updateValueAndValidity();
          this.eventForm.get('itemsFree').setValidators([Validators.required, Validators.pattern(this.itemPricePattern)]);
          this.eventForm.get('itemsFree').updateValueAndValidity();
          this.eventForm.get('maxCom').clearValidators();
          this.eventForm.get('maxCom').updateValueAndValidity();
        }
      }

    })
    this.eventForm.get('maxCom').disable();
    this.eventForm.get('complements').valueChanges.subscribe((value) => {
      console.log('updating max complements', value);
      if (value.trim().length > 0) {
        const maxCom = this.getComplements().length;
        console.log(maxCom);
        this.maxCom = maxCom;
        this.eventForm.get('maxCom').enable();
        this.eventForm.get('maxCom').setValidators([Validators.required, Validators.max(maxCom), Validators.min(1), Validators.pattern('^[0-9]{0,2}$')])
        this.eventForm.get('maxCom').updateValueAndValidity();

      } else {
        this.eventForm.get('maxCom').setValue(null);
        this.eventForm.get('maxCom').disable();
        this.eventForm.get('maxCom').clearValidators();
        this.eventForm.get('maxCom').updateValueAndValidity();
      }
    })
  }

  // onChangeComplements(){
  //   console.log('hey mosies');
  //   const value = this.eventForm.get('complements').value;
  //   if(value.trim().length > 0){
  //     this.eventForm.get('maxCom').enable();
  //   }else{

  //   }
  // }

  ionViewDidLoad() {
    console.log('ionViewDidLoad NewEventPage');
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }

  getPrices() {
    const prices: string = this.eventForm.get('prices').value.trim();
    const regex = /([^,]{2,})\,\s*(\d{1,4}((\.\d{0,2})|\.?))/g;
    let result;
    const pricesResult: any[] = [];
    while (result = regex.exec(prices)) {
      console.log('search result', result);
      const [, name, price] = result;
      pricesResult.push({
        name: name.trim(),
        price: price.trim()
      });
    }
    return pricesResult;
  }

  getItems() {
    const items: string = this.eventForm.get('items').value.trim();
    return items.split(/[\r\n]/).filter(item => item.trim()).map((item) => {
      return item.split("").reverse().join('').replace(/^(,*)(.*)$/, '$2').split('').reverse().join('')
    })
  }

  getComplements() {
    const complements: string = this.eventForm.get('complements').value.trim();
    return complements.split(/[\r\n]/).filter(complement => complement.trim()).map((item) => {
      return item.split("").reverse().join('').replace(/^(,*)(.*)$/, '$2').split('').reverse().join('')
    })
  }

  getTotalItems() {
    const prices = this.getPrices();
    const items = this.getItems();
    const totalItems: any[] = [];
    items.forEach((item) => {
      prices.forEach((price) => {
        totalItems.push({
          name: item,
          priceName: price.name,
          price: price.price,
        })
      });
    });
    return totalItems;
  }

  getFreeItems() {
    const itemsFree: string = this.eventForm.get('itemsFree').value.trim();
    const regex = /([^,]{2,})\,\s*(\d{1,4}((\.\d{0,2})|\.?))/g;
    let result;
    const itemsResult: any[] = [];
    while (result = regex.exec(itemsFree)) {
      console.log('search result', result);
      const [, name, price] = result;
      itemsResult.push({
        name: name.trim(),
        price: price.trim()
      });
    }
    return itemsResult;
  }

  setEventDependingOfType() {
    this.event.order = { items: [], complements: [], prices: null, maxCom: null };
    if (this.fondita) {
      this.event.order.items = this.getTotalItems();
      this.event.order.complements = this.getComplements();
      this.event.order.prices = this.getPrices();
      this.event.order.maxCom = this.eventForm.get('maxCom').value != null ? parseInt(this.eventForm.get('maxCom').value) : null;
      this.event.fondie = true;
    } else {
      this.event.order.items = this.getFreeItems();
      this.event.order.complements = null;
    }

  }

  submit() {
    this.event = this.eventForm.value;
    this.setEventDependingOfType();
    if (this.eventForm.get('password').value != 'thatsit') {
      this.ToastCtrl.create({
        message: 'you need the valid password ;)',
        duration: 2000
      }).present();
      return;
    }
    this.viewCtrl.dismiss(this.event);
  }



}
