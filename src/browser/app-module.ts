import { Module } from '../shared/decorators/module.decorator';
import { PowerModeComponent } from './components/power-mode-app.component';

@Module({
  providers: [PowerModeComponent]
})
export class AppModule {
}