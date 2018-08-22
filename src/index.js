import { Multimap } from '@stimulus/multimap';
import { Snitchy, utils } from 'snitchy';
import trim from 'trim';

/**
 * Group by
 *
 * @param {object} obj object to parse
 * @param {string} key key for grouping
 * @returns {object} grouped object
 */
function groupBy(obj, key) {
  return Object.keys(obj).reduce((acc, cur) => {
    const o = obj[cur];
    const p = o[key];

    if (acc[p]) {
      acc[p].push(o);
    } else {
      acc[p] = [o];
    }

    return acc;
  }, {});
}

export default class SnitchyKaplaPlugin {
  constructor(snitchy) {
    this.name = 'SnitchyPlugin';
    this.snitchy = snitchy;
    this.variables = snitchy.variables.components;
    this.triggersByElement = new Multimap();
    this.listenersByElement = new Multimap();
  }
  init() {
    this.snitchy.addPrefix('el', {
      fn(key, values, scope) {
        const attr = key;
        const htmlAttr = utils.kebabCase(key);

        return scope.$el.attr || scope.$el.getAttribute(htmlAttr) || trim(scope.$el[attr]);
      },
      error: () => 'Unable to get "this.$el". No scope found',
    });
    this.snitchy.addPrefix('ref', {
      fn(key, values, scope) {
        let refKey;
        let attr;

        if (key.match(/[A-Z]/)) {
          [refKey, attr] = Snitchy.parseValue(key);
        }

        const ref = scope.$refs[refKey];

        if (ref === undefined) {
          utils.displayErrors(`Unable to find "this.$refs.${refKey}" reference.`);
        } else {
          const htmlAttr = utils.kebabCase(attr);

          return scope.$el.attr || scope.$el.getAttribute(htmlAttr) || trim(scope.$el[attr]);
        }

        return null;
      },
      error: () => 'Unable to get "this.$refs". No scope found',
    });
  }
  bindAll(instance, events) {
    const { context, slug } = instance;
    const { element } = context;

    // Get data for slug…
    const data = this.variables[slug];

    if (data) {
      // Get variables with trigger property.
      const variables = Object
        .keys(data)
        .map(description => data[description])
        .filter(block => block.trigger);
      const variablesByTrigger = groupBy(variables, 'trigger');

      // Store all triggers for this element.
      // Triggers used inside the component element will be "triggered" after "handleEvent".
      // If trigger is NOT used inside the component,
      // create, add and store specific listener for this element
      Object.keys(variablesByTrigger).forEach(trigger => {
        this.triggersByElement.add(element, trigger);
        if (!events.includes(trigger)) {
          const listener = this.snitchy.component.bind(this.snitchy, slug, null, instance, trigger);

          element.addEventListener(trigger, listener);
          this.listenersByElement.add(element, listener);
        }
      });
    }
  }
  unbindAll(instance, events) {
    const { context } = instance;
    const { element } = context;

    // Delete all triggers for this element.
    // If element has triggers NOT used inside the component (and then specific listeners),
    // remove and delete listeners for this element.
    this.triggersByElement.getValuesForKey(element).forEach(trigger => {
      this.triggersByElement.delete(element, trigger);
      if (!events.includes(trigger)) {
        const listeners = this.listenersByElement.getValuesForKey(element);

        listeners.forEach(listener => {
          element.removeEventListener(trigger, listener);
          this.listenersByElement.delete(element, listener);
        });
      }
    });
  }
  handleEvent(instance, e) {
    const { context, slug } = instance;
    const { element } = context;
    const { type: trigger } = e;

    if (this.triggersByElement.has(element, trigger)) {
      this.snitchy.component(slug, null, instance, trigger);
    }
  }
}
