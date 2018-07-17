import { Component } from '@angular/core';
import { NavController, App } from 'ionic-angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { LoginPage } from '../login/login';
import { UserProvider } from '../../providers/user/user';


@Component({
  selector: 'page-contact',
  templateUrl: 'contact.html'
})
export class ContactPage {
  user: any;
  constructor(public navCtrl: NavController, private afa: AngularFireAuth, private userService: UserProvider, public appCtrl: App) {
    this.user = userService.getCurrentUserState();
  }

  logout(){
    this.afa.auth.signOut().then(result => {
      //this.appCtrl.getRootNav().setRoot(LoginPage);
      document.location.href = 'index.html';
    })
  }

}
