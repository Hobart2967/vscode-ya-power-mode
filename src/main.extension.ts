import 'reflect-metadata';
import { ExtensionContext } from 'vscode';
import { AppModule } from './extension/app.module';
import { ExtensionContextToken } from './extension/models/extension-context';
import { PowerModeExtension } from './extension/power-mode-extension';
import { bootstrap } from './shared/utilities/bootstrap';

module.exports = (() => {
  let extension: PowerModeExtension | null | undefined;

  return {
    activate: (context: ExtensionContext) => {
      const container = bootstrap(AppModule, {
        providers: [
          { provide: ExtensionContextToken, useValue: context }
        ]
      });

      extension = container.get(PowerModeExtension);

      extension.onInit();
    },
    deactivate: (context: ExtensionContext) =>
      extension!.deactivate()
  };
})();
