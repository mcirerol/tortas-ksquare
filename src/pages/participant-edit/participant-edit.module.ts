import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ParticipantEditPage } from './participant-edit';

@NgModule({
  declarations: [
    ParticipantEditPage,
  ],
  imports: [
    IonicPageModule.forChild(ParticipantEditPage),
  ],
})
export class ParticipantEditPageModule {}
