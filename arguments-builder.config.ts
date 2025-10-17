import { defineConfig } from "@iringo/arguments-builder";
export default defineConfig({
	output: {
		surge: {
			path: "./dist/iRingo.Maps.sgmodule",
			transformEgern: {
				enable: true,
				path: "./dist/iRingo.Maps.yaml",
			},
		},
		loon: {
			path: "./dist/iRingo.Maps.plugin",
		},
		customItems: [
			{
				path: "./dist/iRingo.Maps.snippet",
				template: "./template/quantumultx.handlebars",
			},
			{
				path: "./dist/iRingo.Maps.stoverride",
				template: "./template/stash.handlebars",
			},
		],
		dts: { isExported: true, path: "./src/types.d.ts" },
		boxjsSettings: {
			path: "./template/boxjs.settings.json",
			scope: "@iRingo.Maps.Settings",
		},
	},
	args: [
		{
			defaultValue: "CN",
			description: "此选项影响“地图”整体配置内容，包括以下的地图功能与服务。",
			key: "GeoManifest.Dynamic.Config.CountryCode",
			name: "[动态配置] 资源清单的国家或地区代码",
			options: [
				{ key: "AUTO", label: "🇺🇳自动（跟随用户当前所在地区）" },
				{ key: "CN", label: "🇨🇳中国大陆" },
				{ key: "HK", label: "🇭🇰中国香港" },
				{ key: "TW", label: "🇹🇼中国台湾" },
				{ key: "SG", label: "🇸🇬新加坡" },
				{ key: "US", label: "🇺🇸美国" },
				{ key: "JP", label: "🇯🇵日本" },
				{ key: "AU", label: "🇦🇺澳大利亚" },
				{ key: "GB", label: "🇬🇧英国" },
				{ key: "KR", label: "🇰🇷韩国" },
				{ key: "CA", label: "🇨🇦加拿大" },
				{ key: "IE", label: "🇮🇪爱尔兰" },
			],
			type: "string",
		},
		{
			defaultValue: "AutoNavi",
			description:
				"地点数据接口，此选项影响公共指南，兴趣点(POI)与位置信息等功能。",
			key: "UrlInfoSet.Dispatcher",
			name: "[URL信息集] 调度器",
			options: [
				{ key: "AUTO", label: "🇺🇳自动（随[动态配置]版本自动选择）" },
				{
					key: "AutoNavi",
					label:
						"🧭高德（🇨🇳:互动百科/大众点评/携程 | 🇺🇳:维基百科/Yelp/Booking）",
				},
				{ key: "Apple", label: "Apple（维基百科/Yelp/Booking）" },
			],
			type: "string",
		},
		{
			defaultValue: "AutoNavi",
			description: "导航与ETA服务接口，此选项影响导航与ETA(到达时间)等功能。",
			key: "UrlInfoSet.Directions",
			name: "[URL信息集] 导航与ETA",
			options: [
				{ key: "AUTO", label: "🇺🇳自动（随[动态配置]版本自动选择）" },
				{ key: "AutoNavi", label: "🧭高德（🇨🇳:高德地图 | 🇺🇳:TomTom）" },
				{ key: "Apple", label: "Apple（🇨🇳:🈚️ | 🇺🇳:TomTom）" },
			],
			type: "string",
		},
		{
			defaultValue: "Apple",
			description: "评分和照片服务接口，此选项影响评分和照片服务以及照片使用。",
			key: "UrlInfoSet.RAP",
			name: "[URL信息集] 评分和照片",
			options: [
				{ key: "AUTO", label: "🇺🇳自动（随[动态配置]版本自动选择）" },
				{ key: "AutoNavi", label: "🧭高德（🇨🇳:🈶️但未开放 | 🇺🇳:🈚️）" },
				{ key: "Apple", label: "Apple（🇨🇳:🈚️ | 🇺🇳:🈶️）" },
			],
			type: "string",
		},
		{
			defaultValue: "AUTO",
			description:
				"定位漂移修正服务接口，控制定位漂移和🧭指南针与📍坐标的经纬度。",
			key: "UrlInfoSet.LocationShift",
			name: "[URL信息集] 定位漂移",
			options: [
				{ key: "AUTO", label: "🇺🇳自动（随[动态配置]版本自动选择）" },
				{ key: "AutoNavi", label: "🧭高德（🈚️坐标，使用🇨🇳GCJ-02坐标）" },
				{ key: "Apple", label: "Apple（🈶️坐标，使用🇺🇳WGS-84坐标）" },
			],
			type: "string",
		},
		{
			defaultValue: "HYBRID",
			description: "此选项影响所列位图、影像与模型数据。",
			key: "TileSet.Satellite",
			name: "[瓦片数据集] 卫星图像",
			options: [
				{ key: "AUTO", label: "🇺🇳自动（随[动态配置]版本自动选择）" },
				{ key: "HYBRID", label: "混合（🇨🇳:2D较新 | 🇺🇳:主要城市3D）" },
				{ key: "CN", label: "🇨🇳中国四维（🇨🇳:2D较新 | 🇺🇳:🈚️）" },
				{ key: "XX", label: "🇺🇳DigitalGlobe（🇨🇳:2D较旧 | 🇺🇳:2D+主要城市3D）" },
			],
			type: "string",
		},
		{
			key: "LogLevel",
			name: "[调试] 日志等级",
			type: "string",
			defaultValue: "WARN",
			description: "选择脚本日志的输出等级，低于所选等级的日志将全部输出。",
			options: [
				{ key: "OFF", label: "关闭" },
				{ key: "ERROR", label: "❌ 错误" },
				{ key: "WARN", label: "⚠️ 警告" },
				{ key: "INFO", label: "ℹ️ 信息" },
				{ key: "DEBUG", label: "🅱️ 调试" },
				{ key: "ALL", label: "全部" },
			],
		},
	],
});
