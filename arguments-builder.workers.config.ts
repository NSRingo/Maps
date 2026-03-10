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
				path: "./dist/iRingo.Maps.Workers.srmodule",
				template: "./template/shadowrocket.workers.handlebars",
			},
			{
				path: "./dist/iRingo.Maps.Workers.stoverride",
				template: "./template/stash.workers.handlebars",
			},
		]
	},
});
