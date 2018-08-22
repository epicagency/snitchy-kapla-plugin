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
    this.triggersBySlug = new Multimap();
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
    const { slug, context } = instance;
    const data = this.variables[slug];

    if (data) {
      this.triggers = [];

      // Get variables with trigger
      const variables = Object
        .keys(data)
        .map(description => data[description])
        .filter(block => block.trigger);
      const variablesByTrigger = groupBy(variables, 'trigger');

      Object.keys(variablesByTrigger).forEach(trigger => {
        this.triggersBySlug.add(slug, trigger);
        if (!events.includes(trigger)) {
          this.triggers.push(trigger);
          context.element.addEventListener(
            trigger,
            this.snitchy.component.bind(this.snitchy, slug, null, instance, trigger)
          );
        }
      });
    }
  }
  unbindAll(instance) {
    const { context } = instance;

    this.triggers.forEach(trigger => {
      context.element.removeEventListener(trigger);
    });
  }
  handleEvent(instance, e) {
    const { slug } = instance;
    const { type: trigger } = e;

    if (this.triggersBySlug.has(slug, trigger)) {
      this.snitchy.component(slug, null, instance, trigger);
    }
  }
}
