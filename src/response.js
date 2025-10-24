import { $app, Console, done, Lodash as _, Storage } from "@nsnanocat/util";
import XML from "./XML/XML.mjs";
import database from "./function/database.mjs";
import setENV from "./function/setENV.mjs";
import GEOResourceManifest from "./class/GEOResourceManifest.mjs";
import GEOResourceManifestDownload from "./class/GEOResourceManifestDownload.mjs";
/***************** Processing *****************/
// 解构URL
const url = new URL($request.url);
Console.info(`url: ${url.toJSON()}`);
// 获取连接参数
const PATHs = url.pathname.split("/").filter(Boolean);
Console.info(`PATHs: ${PATHs}`);
// 解析格式
const FORMAT = ($response.headers?.["Content-Type"] ?? $response.headers?.["content-type"])?.split(";")?.[0];
Console.info(`FORMAT: ${FORMAT}`);
const PLATFORM = ["Maps"];
if (url.searchParams.get("os") === "watchos") PLATFORM.push("Watch");
Console.info(`PLATFORM: ${PLATFORM}`);
!(async () => {
	/**
	 * 设置
	 * @type {{Settings: import('./types').Settings}}
	 */
	const { Settings, Caches, Configs } = setENV("iRingo", PLATFORM, database);
	Console.logLevel = Settings.LogLevel;
	// 创建空数据
	let body = {};
	// 格式判断
	switch (FORMAT) {
		case undefined: // 视为无body
			break;
		case "application/x-www-form-urlencoded":
		case "text/plain":
		default:
			break;
		case "application/x-mpegURL":
		case "application/x-mpegurl":
		case "application/vnd.apple.mpegurl":
		case "audio/mpegurl":
			break;
		case "text/xml":
		case "text/html":
		case "text/plist":
		case "application/xml":
		case "application/plist":
		case "application/x-plist":
			// 主机判断
			switch (url.hostname) {
				case "configuration.ls.apple.com":
					BigInt.prototype.toJSON = function () {
						return this.toString();
					};
					body = XML.parse($response.body);
					// 路径判断
					switch (url.pathname) {
						case "/config/defaults": {
							const PLIST = body.plist;
							if (PLIST) {
								// CN
								PLIST["com.apple.GEO"].CountryProviders.CN.ShouldEnableLagunaBeach = true; // XX
								delete PLIST["com.apple.GEO"]?.CountryProviders?.CN?.DrivingMultiWaypointRoutesEnabled; // 路线-驾驶-停靠点
								delete PLIST["com.apple.GEO"]?.CountryProviders?.CN?.LocalitiesAndLandmarksSupported; // 支持地名和地标
								delete PLIST["com.apple.GEO"]?.CountryProviders?.CN?.NavigationShowHeadingKey; // 导航时显示朝向按钮
								delete PLIST["com.apple.GEO"]?.CountryProviders?.CN?.POIBusynessRealTime; // 兴趣点繁忙度的实时展示？（需要，默认仅 CN 停用）
								delete PLIST["com.apple.GEO"]?.CountryProviders?.CN?.PedestrianAREnabled; // 步行-现实世界中的线路-举起以查看
								PLIST["com.apple.GEO"].CountryProviders.CN.SupportsCarIntegration = true; // 支持车辆集成
								PLIST["com.apple.GEO"].DrivingMultiWaypointRoutesEnabled = true; // 路线-驾驶-停靠点（不需要，默认全局启用）
								PLIST["com.apple.GEO"].LocalitiesAndLandmarksSupported = true; // 支持地名和地标（不需要，默认全局启用）
								PLIST["com.apple.GEO"].NavigationShowHeadingKey = true; // 导航时显示朝向按钮（需要，默认全局停用）
								PLIST["com.apple.GEO"]["6694982d2b14e95815e44e970235e230"] = true; // ?（需要，默认仅 US 启用）
								PLIST["com.apple.GEO"].OpticalHeadingEnabled = true; // 步行-导航精确度-增强（需要，默认仅 US 启用）
								PLIST["com.apple.GEO"].PedestrianAREnabled = true; // 步行-现实世界中的线路-举起以查看（不需要，默认全局启用）
								PLIST["com.apple.GEO"].TransitPayEnabled = true; // 地图 App 中的交通卡和支付卡（不需要，默认全局启用）
								PLIST["com.apple.GEO"].UseCLPedestrianMapMatchedLocations = true; // 使用 Pedestrian 地图匹配位置？（需要，默认仅 US 启用）
							}
							break;
						}
					}
					$response.body = XML.stringify(body);
					break;
				case "gspe1-ssl.ls.apple.com":
					// 路径判断
					switch (url.pathname) {
						case "/pep/gcc":

							break;
					}
					break;
			}
			break;
		case "text/vtt":
		case "application/vtt":
			break;
		case "text/json":
		case "application/json":
			body = JSON.parse($response.body ?? "{}");
			Console.debug(`body: ${JSON.stringify(body)}`);
			$response.body = JSON.stringify(body);
			break;
		case "application/protobuf":
		case "application/x-protobuf":
		case "application/vnd.google.protobuf":
		case "application/grpc":
		case "application/grpc+proto":
		case "application/octet-stream": {
			let rawBody = $app === "Quantumult X" ? new Uint8Array($response.bodyBytes ?? []) : ($response.body ?? new Uint8Array());
			switch (FORMAT) {
				case "application/protobuf":
				case "application/x-protobuf":
				case "application/vnd.google.protobuf":
				case "application/octet-stream":
					switch (url.hostname) {
						case "gspe35-ssl.ls.apple.com":
							switch (url.pathname) {
								case "/config/announcements":
									break;
								case "/geo_manifest/dynamic/config": {
									body = GEOResourceManifestDownload.decode(rawBody);
									const CountryCode = url.searchParams.get("country_code");
									const ETag = $response.headers?.Etag ?? $response.headers?.etag;
									switch (CountryCode) {
										case "CN": {
											//GEOResourceManifest.cacheResourceManifest(body, Caches, "CN", ETag);
											Caches.CN = body;
											const { ETag: XXETag, body: USBody } = await GEOResourceManifest.downloadResourceManifest($request, "US");
											Caches.XX = GEOResourceManifestDownload.decode(USBody);
											break;
										}
										case "KR": {
											//GEOResourceManifest.cacheResourceManifest(body, Caches, "KR", ETag);
											Caches.KR = body;
											const { ETag: CNETag, body: CNBody } = await GEOResourceManifest.downloadResourceManifest($request, "CN");
											Caches.CN = GEOResourceManifestDownload.decode(CNBody);
											break;
										}
										default: {
											//GEOResourceManifest.cacheResourceManifest(body, Caches, "XX", ETag);
											Caches.XX = body;
											const { ETag: CNETag, body: CNBody } = await GEOResourceManifest.downloadResourceManifest($request, "CN");
											Caches.CN = GEOResourceManifestDownload.decode(CNBody);
											break;
										}
									}
									body.tileSet = GEOResourceManifest.tileSets(body.tileSet, Caches, Settings, CountryCode);
									body.attribution = GEOResourceManifest.attributions(body.attribution, Caches, CountryCode);
									body.resource = GEOResourceManifest.resources(body.resource, Caches, CountryCode);
									body.dataSet = GEOResourceManifest.dataSets(body.dataSet, Caches, CountryCode);
									body.urlInfoSet = GEOResourceManifest.urlInfoSets(body.urlInfoSet, Caches, Settings, CountryCode);
									body.muninBucket = GEOResourceManifest.muninBuckets(body.muninBucket, Caches, Settings);
									body.displayString = GEOResourceManifest.displayStrings(body.displayString, Caches, CountryCode);
									body.tileGroup = GEOResourceManifest.tileGroups(body.tileGroup, body.tileSet, body.attribution, body.resource);
									Console.debug(`releaseInfo: ${body.releaseInfo}`);
									rawBody = GEOResourceManifestDownload.encode(body);
									break;
								}
							}
							break;
					}
					break;
				case "application/grpc":
				case "application/grpc+proto":
					break;
			}
			// 写入二进制数据
			$response.body = rawBody;
			break;
		}
	}
})()
	.catch(e => Console.error(e))
	.finally(() => done($response));
