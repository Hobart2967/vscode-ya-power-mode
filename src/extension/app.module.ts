import { Module } from '../shared/decorators/module.decorator';
import { PowerModeExtension } from './power-mode-extension';
import { SoundProcessorService } from './services/sound-processor.service';
import { SoundHostViewProvider } from './views/sound-host.view-provider';

@Module({
  providers: [
    SoundProcessorService,
    SoundHostViewProvider,
    PowerModeExtension
  ]
})
export class AppModule {
}