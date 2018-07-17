import { Component, OnInit } from '@angular/core';
import { NavController, LoadingController, ToastController, Platform } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { TabsPage } from '../tabs/tabs'
import { UserProvider } from '../../providers/user/user';
import { Storage } from '@ionic/storage'
import 'rxjs/add/operator/take';


@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage implements OnInit {

  constructor(public navCtrl: NavController, private afAuth: AngularFireAuth,
    private userService: UserProvider, private loadingCtrl: LoadingController, private platform: Platform,
    private storage: Storage, private toastCtrl: ToastController) {
    console.log('constructor');
    const loading = loadingCtrl.create({ content: 'Loading...' });
    loading.present();
    afAuth.authState.take(1).subscribe(state => {
      console.log('authState', state);
      loading.dismiss();
      if (state) {
        this.setupUser(state);
      }
    });

  }

  ngOnInit() {
    console.log('on init');
  }
  setupUser(state) {
    const loading = this.loadingCtrl.create({ content: 'Login...' });
    loading.present();
    this.userService.setUserState(state);
    return <Promise<any>>this.userService.saveOrUpdateUser(state.displayName, state.uid)
      .then(() => {
        loading.dismiss();
        this.navCtrl.setRoot(TabsPage);
      })
      .catch((error) => {
        this.afAuth.auth.signOut();
        this.userService.setUserState(null);
        console.log('catch');
        this.toastCtrl.create({ message: 'An error ocurred trying to login', duration: 3000 }).present();
        loading.dismiss();
        console.error(error);
      })
  }


  loginWithFB() {
    this.login('fb');
  }

  loginWithGoogle() {
    this.login('google');
  }

  login(providerOption) {
    const loading = this.loadingCtrl.create({ content: 'Login...' });
    loading.present();
    let provider = null;
    if (providerOption === 'fb') {
      provider = new firebase.auth.FacebookAuthProvider();
    } else {
      provider = new firebase.auth.GoogleAuthProvider();
    }
    if (!(this.platform.is('ios') || this.platform.is('android'))) {
      this.afAuth.auth.signInWithPopup(provider).then(result => {
        console.log('hello, can yo hear me', result);
        loading.dismiss();
        return this.setupUser(result.user);
      }).catch(error => {
        loading.dismiss();
        console.error(error);
      })
    } else {
      this.afAuth.auth.signInWithRedirect(provider).then(result => {
        console.log('result', result);
        return this.afAuth.auth.getRedirectResult();
        //this.navCtrl.setRoot(TabsPage);
      }).then((result) => {
        console.log(result, 'result get redirect result');
        loading.dismiss();
        this.setupUser(result.user);
      }).catch(error => {
        loading.dismiss();
        console.error(error);
      })
    }


  }

  onSuccessfulLoginDevice() {
    console.log('hello , can you her me guy')
  }

}
