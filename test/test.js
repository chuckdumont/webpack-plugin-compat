const should = require("should");
const tapable = require("tapable");
const {Tapable, reg, tap, callSync, callSyncBail, callSyncWaterfall, callAsyncParallel, callAsyncParallelBail, callAsyncSeries, callAsyncSeriesWaterfall} = require("../index").for("test");
const tapableVersionMajor = parseInt(require("tapable/package.json").version.split(".")[0]);
const version = tapableVersionMajor >= 2 ? 'V5' : tapableVersionMajor >= 1 ? 'V4' : 'V3';
console.log('Testing Tapable for Webpack ' + version);

describe("Plugin Compatibility layer tests", function() {
	it("test Sync", function() {
		const plugin = new Tapable();
		const context = {};
		reg(plugin, {"test Sync" : ["Sync", "arg1", "arg2", "arg3"]});
		if (version === 'V5') {
			(plugin.hooks.testSync.constructor.name).should.be.eql(tapable.SyncHook.name);
		} else if (version === 'V4') {
			(plugin.hooks.testSync instanceof tapable.SyncHook).should.be.eql(true);
		}
		tap(plugin, {"test Sync" : function(arg1, arg2, arg3) {
			this.result = arg1 + arg2 + arg3;
		}}, context);
		if (version === 'V5' || version === 'V4') {
			plugin.hooks.testSync.taps.length.should.be.eql(1);
		} else {
			plugin._plugins['test Sync'].length.should.be.eql(1);
		}
		callSync(plugin, "test Sync", "1", "2", "3");
		context.result.should.be.eql("123");
	});

	it("test SyncBail", function() {
		const plugin = new Tapable();
		if (version === 'V5' || version === 'V4') {
			plugin.hooks = {"foo": "bar"};
		}
		reg(plugin, "test SyncBail", ["SyncBail", "arg1", "arg2", "arg3"]);
		if (version === 'V5' || version === 'V4') {
			plugin.hooks.foo.should.be.eql("bar"); // make sure reg() didn't overwrite
			if (version === 'V5') {
				(plugin.hooks.testSyncBail.constructor.name).should.be.eql(tapable.SyncBailHook.name);
			} else {
				(plugin.hooks.testSyncBail instanceof tapable.SyncBailHook).should.be.eql(true);
			}
		}
		tap(plugin, "test SyncBail", (arg1, arg2, arg3) => {
			return arg1 + arg2 + arg3;
		});
		if (version === 'V5' || version === 'V4') {
			plugin.hooks.testSyncBail.taps.length.should.be.eql(1);
		} else {
			plugin._plugins['test SyncBail'].length.should.be.eql(1);
		}
		callSyncBail(plugin, "test SyncBail", "1", "2", "3").should.be.eql("123");
	});

	it("test SyncWaterfall", function() {
		debugger; //eslint-disable-line
		const plugin = new Tapable();
		reg(plugin, {"test SyncWaterfall" : ["SyncWaterfall", "arg1", "arg2", "arg3"]});
		if (version === 'V5') {
			(plugin.hooks.testSyncWaterfall.constructor.name).should.be.eql(tapable.SyncWaterfallHook.name);
		} else if (version === 'V4') {
			(plugin.hooks.testSyncWaterfall instanceof tapable.SyncWaterfallHook).should.be.eql(true);
		}
		tap(plugin, [[["test SyncWaterfall"], (arg1, arg2, arg3) => {
			return arg1 + arg2 + arg3;
		}]]);
		if (version === 'V5' || version === 'V4') {
			plugin.hooks.testSyncWaterfall.taps.length.should.be.eql(1);
		} else {
			plugin._plugins['test SyncWaterfall'].length.should.be.eql(1);
		}
		callSyncWaterfall(plugin, "test SyncWaterfall", "1", "2", "3").should.be.eql("123");
	});

	it("test AsyncParallel", function(done) {
		const plugin = new Tapable();
		reg(plugin, {"test AsyncParallel" : ["AsyncParallel", "arg1", "arg2", "arg3", "callback"]});
		if (version === 'V5') {
			(plugin.hooks.testAsyncParallel.constructor.name).should.be.eql(tapable.AsyncParallelHook.name);
		} else if (version === 'V4') {
			(plugin.hooks.testAsyncParallel instanceof tapable.AsyncParallelHook).should.be.eql(true);
		}
		tap(plugin, "test AsyncParallel", (arg1, arg2, arg3, callback) => {
			callback(arg1 + arg2 + arg3);
		});
		if (version === 'V5' || version === 'V4') {
			plugin.hooks.testAsyncParallel.taps.length.should.be.eql(1);
		} else {
			plugin._plugins['test AsyncParallel'].length.should.be.eql(1);
		}
		callAsyncParallel(plugin, "test AsyncParallel", "1", "2", "3", result => {
			result.should.be.eql("123");
			done();
		});
	});

	it("test AsyncParallelBail", function(done) {
		const plugin = new Tapable();
		reg(plugin, {"test AsyncParallelBail" : ["AsyncParallelBail", "arg1", "arg2", "arg3", "callback"]});
		if (version === 'V5') {
			(plugin.hooks.testAsyncParallelBail.constructor.name).should.be.eql(tapable.AsyncParallelBailHook.name);
		} else if (version === 'V4') {
			(plugin.hooks.testAsyncParallelBail instanceof tapable.AsyncParallelBailHook).should.be.eql(true);
		}
		tap(plugin, "test AsyncParallelBail", (arg1, arg2, arg3, callback) => {
			callback(arg1 + arg2 + arg3);
		});
		if (version === 'V5' || version === 'V4') {
			plugin.hooks.testAsyncParallelBail.taps.length.should.be.eql(1);
		} else {
			plugin._plugins['test AsyncParallelBail'].length.should.be.eql(1);
		}
		callAsyncParallelBail(plugin, "test AsyncParallelBail", "1", "2", "3", result => {
			result.should.be.eql("123");
			done();
		});
	});

	it("test AsyncSeries", function(done) {
		const plugin = new Tapable();
		reg(plugin, {"test AsyncSeries" : ["AsyncSeries", "arg1", "arg2", "arg3", "callback"]});
		if (version === 'V5') {
			(plugin.hooks.testAsyncSeries.constructor.name).should.be.eql(tapable.AsyncSeriesHook.name);
		} else if (version === 'V4') {
			(plugin.hooks.testAsyncSeries instanceof tapable.AsyncSeriesHook).should.be.eql(true);
		}
		tap(plugin, "test AsyncSeries", (arg1, arg2, arg3, callback) => {
			callback(arg1 + arg2 + arg3);
		});
		if (version === 'V5' || version === 'V4') {
			plugin.hooks.testAsyncSeries.taps.length.should.be.eql(1);
		} else {
			plugin._plugins['test AsyncSeries'].length.should.be.eql(1);
		}
		callAsyncSeries(plugin, "test AsyncSeries", "1", "2", "3", result => {
			result.should.be.eql("123");
			done();
		});
	});

	it("test AsyncSeriesWaterfall", function(done) {
		const plugin = new Tapable();
		reg(plugin, {"test AsyncSeriesWaterfall" : ["AsyncSeriesWaterfall", "init", "callback"]});
		if (version === 'V5') {
			(plugin.hooks.testAsyncSeriesWaterfall.constructor.name).should.be.eql(tapable.AsyncSeriesWaterfallHook.name);
		} else if (version === 'V4') {
			(plugin.hooks.testAsyncSeriesWaterfall instanceof tapable.AsyncSeriesWaterfallHook).should.be.eql(true);
		}
		tap(plugin, "test AsyncSeriesWaterfall", (init, callback) => {
			callback(init.reduce((accumulator, value) => accumulator+value));
		});
		if (version === 'V5' || version === 'V4') {
			plugin.hooks.testAsyncSeriesWaterfall.taps.length.should.be.eql(1);
		} else {
			plugin._plugins['test AsyncSeriesWaterfall'].length.should.be.eql(1);
		}
		callAsyncSeriesWaterfall(plugin, "test AsyncSeriesWaterfall", ["1", "2", "3"], result => {
			result.should.be.eql("123");
			done();
		});
	});

	if (version === 'V5' || version === 'V4') {
		it("test HookMap handling (V4 only)", function(done) {
			const plugin = new Tapable();
			const keyedHook = new tapable.HookMap(() => new tapable.SyncBailHook(["arg1", "arg2", "arg3"]));
			plugin.hooks = {key:keyedHook};
			tap(plugin, {"key test HookMap handling": (arg1, arg2, arg3) => {
				return arg1 + arg2 + arg3;
			}},plugin, {stage:-1});
			plugin.hooks.key._map.get("testHookMapHandling").taps[0].stage.should.be.eql(-1);
			callSyncBail(plugin, "key test HookMap handling", "1", "2", "3").should.be.eql("123");
			done();
		});

		it("test special case handling for 'parser' hook (V4 only)", function(done) {
			const plugin = new Tapable();
			const parserHook = new tapable.HookMap(() => new tapable.SyncBailHook(["arg1", "arg2", "arg3"]));
			plugin.hooks = {parser:parserHook};
			const parserHookFn = (arg1, arg2, arg3) => {
				return arg1 + arg2 + arg3;
			};
			if (version === 'V5') {
				parserHook.for("javascript/auto").tap("test", parserHookFn);
			} else {
				parserHook.tap("javascript/auto", "test", parserHookFn);
			}
			callSyncBail(plugin, "parser" , "1", "2", "3").should.be.eql("123");
			done();
		});

		it("Error on attempt to register an already registered hook (V4 only)", function() {
			const plugin = new Tapable();
			reg(plugin, "test Sync", ["Sync"]);
			try {
				reg(plugin, "test Sync", ["Sync", "arg"]);
				should.fail("Should never get here");
			} catch (err) {
				err.message.should.be.eql("Hook testSync already registered");
			}
		});

		it("Error on registering unsuppored hook type", function() {
			const plugin = new Tapable();
			try {
				reg(plugin, "test Unsupported", ["Unsupported"]);
				should.fail("Should never get here");
			} catch (err) {
				err.message.should.be.eql("Unsupported hook type Unsupported");
			}
		});
		it("Error trying to tap unregistered hook", function() {
			const plugin = new Tapable();
			plugin.hooks = {};
			try {
				tap(plugin, "test Unregistered", () => {});
				should.fail("Should never get here");
			} catch (err) {
				err.message.should.be.eql("No hook for test Unregistered in object Tapable");
			}
		});

		it("Error with no plugin name specified", function() {
			const pluginCompat = require("../index").for("");
			const plugin = new Tapable();
			pluginCompat.reg(plugin, "test Sync", ["Sync"]);
			try {
				pluginCompat.tap(plugin, "test Sync", () => {});
				should.fail("Should never get here");
			} catch (err) {
				err.message.should.be.eql("No plugin name provided");
			}
		});

		it("Error calling undefined hook", function() {
			const plugin = new Tapable();
			plugin.hooks = {};
			try {
				callSync(plugin, "test Unregistered", () => {});
				should.fail("Should never get here");
			} catch (err) {
				err.message.should.be.eql("No hook for test Unregistered in object Tapable");
			}
		});

		it("Error calling wrong hook type", function() {
			const plugin = new Tapable();
			reg(plugin, "test SyncBail", ["SyncBail", "arg1", "arg2", "arg3"]);
			tap(plugin, "test SyncBail", (arg1, arg2, arg3) => {
				return arg1 + arg2 + arg3;
			});
			try {
				callSync(plugin, "test SyncBail", "1", "2", "3");
				should.fail("Should never get here");
			} catch (err) {
				err.message.should.be.eql("Attempt to call SyncBailHook from a SyncHook call");
			}
		});
	}
});
