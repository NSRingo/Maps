import { defineConfig } from "@iringo/arguments-builder";
export default defineConfig({
	output: {
		surge: {
			path: "./dist/iRingo.Maps.Workers.sgmodule",
			template: "./template/surge.workers.handlebars",
			transformEgern: {
				enable: true,
				path: "./dist/iRingo.Maps.Workers.yaml",
			},
		},
		loon: {
			path: "./dist/iRingo.Maps.Workers.plugin",
			template: "./template/loon.workers.handlebars",
		},
		customItems: [
			{
				path: "./dist/iRingo.Maps.Workers.stoverride",
				template: "./template/stash.workers.handlebars",
			},
		],
		dts: { isExported: true, path: "./src/types.d.ts" },
		boxjsSettings: {
			path: "./template/boxjs.settings.workers.json",
			scope: "@iRingo.Maps.Settings",
		},
	},
});
