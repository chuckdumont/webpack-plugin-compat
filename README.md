[![npm][npm]][npm-url]
[![builds][builds]][builds-url]
[![coverage][cover]][cover-url]
[![Apache 2.0 License][apache2]][apache2-url]

# Introduction

**webpack-plugin-compat** is a compatibility layer for the webpack plugin api that simplifies the task of supporting both v4 and pre-v4 versions of webpack.  This plugin provides a compatibility api that can be used with all current versions of webpack.  

# Plugin objects

Before webpack V4, objects that supported the plugin API were instances of Tapable.  In V4, any Javascript object can support the plugin API via the `hooks` property.  This compatibility layer exports an object named Tapable which in V3 is a reference to the Tapable class defined by webpack and in V4 is just a dummy class with no properties or methods.  There is no requirement that the dummy class be used for V4 plugins.  It is provided only for API compatibility.

# Event name mapping

Plugin event names are passed to the underlying plugin api unmodified for pre-v4 versions of webpack.  For v4 and above, event names are canonicalized by removing spaces and hyphens, and camal casing the result, expect as noted below for HookMaps.

For example, `my-event-name` will be mapped to `myEventName`.

# V4 HookMaps

Webpack v4 introduced the concept of [HookMaps](https://github.com/webpack/tapable#hookmap).  This plugin support HookMaps using space delimited tokens in the event name.  The plugin will try to map one or more tokens from the event name to a HookMap name, and if a match is found, then that HookMap will be used.

<!-- eslint-disable no-undef -->
```javascript
tap(plugin, 'evaluate typeof require', function() {/*...*/});
```

is the same as using the v4 plugin APIs

<!-- eslint-disable no-undef -->
```javascript
plugin.hooks.for('evaluateTypeof').tap('require', function() {/*...*/});
```

if plugin.hooks contains a HookMap named `evaluateTypeof`.  If the plugin does not contain a HookMap named `evaluateTypeof`, then the result will be the same as invoking

<!-- eslint-disable no-undef -->
```javascript
plugin.hooks.tap('evaluateTypeofRequire', function() {/*...*/});
```

# Special case event names

For compatibility with pre-v4 behavior, this plugin maps the following event names when using webpack v4 and up.

Note: If you encounter any other event names that require mapping for pre-v4 compatibility, feel free to create a pull-request.

* `parser` -> `parser javascript/auto`

# The API

## reg

The `reg` function registers an event hook.

```javascript
const {Tapable, reg} = require('webpack-plugin-conpat');
const plugin = new Tapable();
reg(plugin, 'myHook', ['Sync', 'arg1', 'arg2']);
```

is equivilent to the following v4 code

```javascript
// Webpack v4
const {SyncHook} = require('tapable');
const plugin = {hooks: {}};
plugin.hooks.myHook = new SyncHook(['arg1', 'arg2']);
```

Multiple event hooks can be registered with a single `reg` call.

<!-- eslint-disable no-undef -->
```javascript
reg(plugin, {
	myHook: ['Sync', 'arg1', 'arg2'],
	myOtherHook: ['SyncBail', 'arg']
});
```

The `reg` function is a noop in pre-v4 webpack.

Supported hook types are:

* `Sync`
* `SyncBail`
* `SyncWaterfall`
* `AsyncSeries`
* `AsyncSeriesWaterfall`
* `AsyncParalell`
* `AsyncParallelBail`

## tap

The `tap` function adds a consumer to an event.  Note: the tap function is only available when a plugin name is provided using the `for` method.

```javascript
const {Tapable, reg, tap} = require('webpack-plugin-conpat').for('myPlugin');
const plugin = new Tapable();
reg(plugin, 'my event', ['Sync', 'arg1', 'arg2']);
tap(plugin, 'my event', (arg1, arg2) => {
	console.log(arg1 + arg2);
});
```

This is equivilent to the following in webpack v4

```javascript
// Webpack v4
const {SyncHook} = require('tapable');
const plugin = {hooks: {}};
plugin.hooks.myEvent = new SyncHook(['arg1', 'arg2']);
plugin.hooks.myEvent.tap('myPlugin', (arg1, arg2) => {
	console.log(arg1 + arg2);
});
```

and the following in webpack v3

```javascript
// Webpack v3
const {Tapable} = require('tapable');
const plugin = new Tapable();
plugin.plugin('my event', (arg1, arg2) => {
	console.log(arg1 + arg2);
});
```

You may optionally specify a context for the callback, and an options object (ignored in V3).

<!-- eslint-disable no-undef -->
```javascript
tap(plugin, 'my event', callback, this, {stage:100});
```

And you can tap multiple events for the same plugin object with a single call

<!-- eslint-disable no-undef -->
```javascript
tap(plugin, {
	'my event': () => {/*...*/},
	'my other event': () => {/*...*/}
}, this);
```

Using array notation instead of object notation, you may specify multiple events names for the same event callback

<!-- eslint-disable no-undef -->
```javascript
tap(compiler, [
	[['run', 'watch-run'], () => {/*...*/}],
	['compilation', () => {/*...*/}]
], context);
```

## callXXX

Event-type specific call functions (e.g. `callSync`, etc.) to invokde event callbacks.  Supported flavors are:

* `callSync`
* `callSyncBail`
* `callSyncWaterfall`
* `callAsyncSeries`
* `callAsyncSeriesWaterfall`
* `callAsyncParallel`
* `callAsyncParallelBail`

```javascript
const {Tapable, reg, tap, callSync} = require('webpack-plugin-conpat').for('myPlugin');
const plugin = new Tapable();
reg(plugin, 'my event', ['Sync', 'arg1', 'arg2']);
tap(plugin, 'my event', (arg1, arg2) => {
	console.log(arg1 + arg2);
});
callSync(plugin, 'my event', '1', '2');
```

In webpack v4, the event type signified by the call function name must match the type of the event hook.

[npm]: https://img.shields.io/npm/v/webpack-plugin-compat.svg
[npm-url]: https://npmjs.com/package/webpack-plugin-compat
[builds-url]: https://travis-ci.org/chuckdumont/webpack-plugin-compat
[builds]: https://travis-ci.org/chuckdumont/webpack-plugin-compat.svg?branch=master
[cover-url]: https://coveralls.io/github/chuckdumont/webpack-plugin-compat?branch=master
[cover]: https://coveralls.io/repos/github/chuckdumont/webpack-plugin-compat/badge.svg?branch=master
[apache2]: https://img.shields.io/badge/license-Apache%202-blue.svg
[apache2-url]: https://www.apache.org/licenses/LICENSE-2.0.txt
