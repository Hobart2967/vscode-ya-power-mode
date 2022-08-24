import { injectable } from 'inversify';
import { Component } from '../decorators/component';
import { ViewProperty } from '../decorators/view-property-decorator';

@Component({
  selector: 'power-mode-app',
  template: require('./power-mode-app.component.html'),
  styles: require('./power-mode-app.component.scss')
})
@injectable()
export class PowerModeComponent extends HTMLElement {
  //#region Properties
  private _comboCounter: number = 0;
  public get comboCounter(): number {
    return this._comboCounter;
  }
  @ViewProperty()
  public set comboCounter(v: number) {
    this._comboCounter = v;
  }
  //#endregion
}