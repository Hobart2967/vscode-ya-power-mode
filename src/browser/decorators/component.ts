import { Container, injectable } from 'inversify';
import { BehaviorSubject } from 'rxjs';
import { AsyncObject } from '../../shared/models/async-object';
import { Type } from '../../shared/models/composition/type.interface';
import { ComponentDeclaration } from '../models/templating/component-declaration.model';

export function Component(componentDeclaration: ComponentDeclaration): ClassDecorator {
  // TODO: Y DIS NOT WORK?! Instead of any, implement Type<HTMLElement&Function>
  return function(target: any) {
    const htmlElementCtor = target as Type<HTMLElement&Function>;

    const WebComponent = injectable()(class extends htmlElementCtor {
      //#region Private Fields
      private readonly _root: ShadowRoot;
      private readonly _context: { [index: string]: AsyncObject<BehaviorSubject<any>> } = {};
      //#endregion

      //#region Ctor
      public constructor(...args: any) {
        super(...args);

        this._root = this.attachShadow({ mode: 'open' });

        if (componentDeclaration.template) {
          this._root.innerHTML = componentDeclaration.template;
          const bindableAttributes = [
            'innerText'
          ];

          bindableAttributes.forEach(attributeName =>
            this.setUpBindings(
              attributeName,
              Array.from(this._root.querySelectorAll(`[:${attributeName}]`))));
        }

        if (componentDeclaration.styles) {
          const styles = document.createElement('style');
          styles.innerHTML = componentDeclaration.styles;
          this._root.appendChild(styles);
        }
      }
      //#endregion

      //#region Private Methods
      private setUpBindings(attributeName: string, elements: HTMLElement[]): void {
        elements.forEach(element =>
          this.setUpBinding(attributeName, element));
      }

      public async setUpBinding(attributeName: string, element: HTMLElement): Promise<void> {
        const componentPropertyName = element.getAttribute(attributeName);
        if (!componentPropertyName) {
          console.error(`Did not set value for ${attributeName} on ${element.tagName}`, element);
          return;
        }

        if (!this._context[componentPropertyName]) {
          this._context[componentPropertyName] = new AsyncObject<BehaviorSubject<any>>();
        }

        const bindingResolver = this._context[componentPropertyName];
        const valueStream = await bindingResolver.value;
        valueStream.subscribe(value =>
          element.setAttribute(attributeName, value.toString()));
      }
      //#endregion
    });

    const CustomElement: CustomElementConstructor = class {
      public constructor() {
        const staticContainer = Component as any;
        const container = staticContainer.container as Container;
        console.log(`Getting`, WebComponent);

        if (!container.isBound(WebComponent)) {
          container
            .bind(WebComponent)
            .toSelf()
            .inTransientScope();
        }

        return staticContainer.container.get(WebComponent);
      }
    } as any;

    // TODO: Make it nice and shiny
    setTimeout(() =>
      window.customElements
        .define(componentDeclaration.selector, CustomElement));

    return WebComponent as any;
  }
}