responsivator-sketch-plugin
=========
[![GitHub release](https://badge.fury.io/gh/novemberfiveco%2Fresponsivator-sketch-plugin.svg?maxAge=3600)](https://github.com/novemberfiveco/responsivator-sketch-plugin/releases)

Sort your artboards based on the target device or section.

## Installation

### From a release (simplest)

* [Download](https://github.com/novemberfiveco/responsivator-sketch-plugin/releases/latest) the latest release of the plugin
* Un-zip
* Double-click on novemberfive-responsivator.sketchplugin
* Install

### From the sources

* Clone the repo
* Install the dependencies (`npm install`)
* Build (`npm run build`)
* Double-click on novemberfive-responsivator.sketchplugin

## Getting started

Name of the artboard should be in following format: `[a-z]-[0-9]-[0-9]` with every slice repeatable n times
For example:
* `x-010-010` -> Device *x* section *010* and screen *010*
* `s-020-010` -> Device *s* section *020* and screen *010*
* `l-010-020` -> Device *l* section *010* and screen *020*
* `xl-0010-0020` -> Device *xl* section *0010* and screen *0020*
* `xxl-1-0` -> Device *xxl* section *1* and screen *0*

Take a look at the [example file](https://github.com/novemberfiveco/responsivator-sketch-plugin/tree/master/example/example.sketch) to see how it works

