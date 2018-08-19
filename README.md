# 📈 Snitchy Kapla Plugin

![stability-wip](https://img.shields.io/badge/stability-work_in_progress-lightgrey.svg?style=flat-square)
[![NPM version](https://img.shields.io/npm/v/snitchy.svg?style=flat-square)](https://www.npmjs.com/package/snitchy)
[![Coverage Status](https://img.shields.io/coveralls/github/epicagency/snitchy/master.svg?style=flat-square)](https://travis-ci.com/epicagency/snitchy)
[![License](https://img.shields.io/badge/license-UNLICENSE-green.svg?style=flat-square)](https://github.com/epicagency/snitchy/blob/master/UNLICENSE)

> Add prefixes (`$el`, `$ref`) and triggers for [Kapla](https://github.com/thierrymichel/kapla) components

## Usage

```js
import { Application } from 'kapla';
import snitchy from 'snitchy';
import SnitchyKaplaPlugin from 'snitchy-kapla-plugin';
import variables from 'data/variables';

snitchy.load(variables);

const app = Application.start(document.body, undefined, {
  snitchy, // Just to be able to `this.snitchy[page || component]` without explicitly importing snitchy inside each component…
});
const snitchyKapla = new SnitchyKaplaPlugin(snitchy);

app.extend(snitchyKapla);

// app load or register…
```

---

Feel free to comment , add an issue or submit a pull request…
