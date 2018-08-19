# Notes

## TBC

- Queueing? (ex: input text on change, Vue.js bindings, etc…)

## TODOS

- [x] Renaming: use `description` term

## Kapla-snitchy code

```js
switch (type) {
  case 'el': {
    const htmlKey = kebabCase(key);

    if (this.scope && this.scope.$el !== undefined) {
      if (key === 'textContent') {
        data = trim(this.scope.$el.textContent);
      } else if (this.scope.$el.getAttribute(htmlKey)) {
        data = this.scope.$el.getAttribute(htmlKey);
      } else {
        displayErrors(`Unable to find "${htmlKey}" attribute.`);
      }
    } else {
      displayErrors('Unable to get "this.$el". No scope found or "this.$el" is undefined.');
    }
    break;
  }
  case 'ref': {
    if (this.scope && this.scope.$refs !== undefined) {
      let attr;

      if (key.match(/[A-Z]/)) {
        [key, attr] = Snitchy.parseValue(key);
      }

      const ref = this.scope.$refs[key];

      if (ref === undefined) {
        displayErrors(`Unable to find "this.$refs.${key}" reference.`);
      } else {
        data = ref.getAttribute(attr) || ref.value || trim(ref.textContent);
      }
    } else {
      displayErrors('Unable to get "this.$refs". No scope found or "this.$refs" is undefined.');
    }
    break;
  }
  default:
}
```
