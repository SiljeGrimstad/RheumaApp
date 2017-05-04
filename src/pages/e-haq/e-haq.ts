import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { EHaqNewEntryPage } from '../e-haq-new-entry/e-haq-new-entry';
import { AuthService } from "../../security/auth.service";
import { LogoutPage } from '../logout/logout';
import { Observable } from 'rxjs/Observable';
import { Http, Response, URLSearchParams, Headers } from '@angular/http';
import { API_URL } from "../../environments/environment";
import { HAQEntry, HAQService, HAQEntryList, HAQQuery } from "./e-haq-service"
import { TranslateService } from '@ngx-translate/core';
import { HaqAnswerForm } from "../e-haq-new-entry/e-haq-new-entry-form"

/*
  Generated class for the EHAQ page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-e-haq',
  templateUrl: 'e-haq.html'
})
export class EHAQPage {
  private query: HAQQuery = { offset: 0, count: 10 };
  eHAQdiaries: Observable<HAQEntryList>;
  results: HAQEntry[];

  diaries: Array<{ date: string, value: string, painvalue: number }>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private authService: AuthService,
    private _http: Http,
    private translate: TranslateService,
    private _haqService: HAQService,
    private alertCtrl: AlertController,
    private form: HaqAnswerForm) {
      this.getDiary();
      console.log("HAQ Overview constructed")

      this.diaries = [];
  }

  ionViewCanEnter(): boolean {
    console.log("Can enter HAQ Overview: " + this.authService.isLoggedIn())
    return this.authService.isLoggedIn();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EHAQPage');
  }

  navNewEntry() {
    this.navCtrl.setRoot(EHaqNewEntryPage)
      .catch(() => this.navCtrl.setRoot(LogoutPage))
  }

  getDiary() {
    this.eHAQdiaries = this._haqService.listEntries(this.query);
    this.eHAQdiaries.forEach(element => {
      this.results = element.results;
      this.results.forEach(entry => {
        entry.score = entry.score *10;
      });

    });
  }

  forceUpdate(){
    this._haqService.refreshAllEntries()
      .subscribe(list => {
        list.results.forEach(result => result.score = result.score*10)
        this.results = list.results
      })
  }

   deleteEntry(entry: HAQEntry){
    console.log("Called deleteEntry step 1");

    this.translate.get('pain.confirmDel').subscribe(
      deleteTitle => {
        this.translate.get('pain.deleteMess').subscribe(
          deleteMessage => {
            this.translate.get('button.cancel').subscribe(
              cancelBtn => {
                this.translate.get('button.delete').subscribe(
                  deleteBtn => {
                    let alert = this.alertCtrl.create({
                    title: deleteTitle,
                    message: deleteMessage + entry.date + "?",
                    buttons: [
                      {
                        text: cancelBtn,
                        role: 'cancel',
                        handler: () => {
                          console.log('Cancel clicked');
                        }
                      },
                      {
                        text: deleteBtn,
                        handler: () => {
                          console.log('Delete clicked');
                          this._haqService.deleteEntry(entry)
                            .subscribe(
                              res =>{
                                if(res){
                                  this.navCtrl.setRoot(this.navCtrl.getActive().component);
                                }else{

                                }
                              },
                              err => console.log("Error deleting entry")
                            );
                          }
                        }
                      ]
                    });
                    alert.present();
                  }
                );
              }
            );
          }
        );
      }
    );
  }
  editEntry(entry: HAQEntry){
    this.form.setList(entry.answers, entry.date);
    this.navCtrl.setRoot(EHaqNewEntryPage)
      .catch(() => this.navCtrl.setRoot(LogoutPage))
  }
}
