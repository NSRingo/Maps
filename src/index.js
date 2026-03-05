import { Hono } from "hono";
import { Console } from "@nsnanocat/util";
import XML from "./XML/XML.mjs";
import database from "./function/database.mjs";
import setENV from "./function/setENV.mjs";
import GEOResourceManifest from "./class/GEOResourceManifest.mjs";
import GEOResourceManifestDownload from "./class/GEOResourceManifestDownload.mjs";
/***************** Processing *****************/

export default new Hono().all("/:rest{.*}", async c => {
	const url = new URL(c.req.url);
	const [host, ...path] = c.req.param("rest").split("/");
    url.protocol = "https:";
    url.hostname = host;
    url.port = "443";
    url.pathname = path.join("/");
	Console.info(`url: ${url.toJSON()}`);
	globalThis.$request = {
        url: url.toString(),
        method: c.req.method,
        headers: c.req.header(),
        body: c.req.method === "GET" ? undefined : await c.req.arrayBuffer(),
    };
	// 获取连接参数
	const PATHs = url.pathname.split("/").filter(Boolean);
	Console.info(`PATHs: ${PATHs}`);
	// 解析格式
	let FORMAT = ($request.headers?.["Content-Type"] ?? $request.headers?.["content-type"])?.split(";")?.[0];
	Console.info(`FORMAT: ${FORMAT}`);
	/**
	 * 设置
	 * @type {{Settings: import('./types').Settings}}
	 */
	let { Settings, Caches, Configs } = setENV("iRingo", "Maps", database);	
	Console.logLevel = Settings.LogLevel;
	// 创建空数据
	let body = {};
	/* 直接返回 */
	// 方法判断
	switch ($request.method) {
		case "POST":
		case "PUT":
		case "PATCH":
		// biome-ignore lint/suspicious/noFallthroughSwitchClause: <explanation>
		case "DELETE":
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
					//body = M3U8.parse($request.body);
					//Console.debug(`body: ${JSON.stringify(body)}`);
					//$request.body = M3U8.stringify(body);
					break;
				case "text/xml":
				case "text/html":
				case "text/plist":
				case "application/xml":
				case "application/plist":
				case "application/x-plist":
					//body = XML.parse($request.body);
					//Console.debug(`body: ${JSON.stringify(body)}`);
					//$request.body = XML.stringify(body);
					break;
				case "text/vtt":
				case "application/vtt":
					//body = VTT.parse($request.body);
					//Console.debug(`body: ${JSON.stringify(body)}`);
					//$request.body = VTT.stringify(body);
					break;
				case "text/json":
				case "application/json":
					//body = JSON.parse($request.body ?? "{}");
					//Console.debug(`body: ${JSON.stringify(body)}`);
					//$request.body = JSON.stringify(body);
					break;
				case "application/protobuf":
				case "application/x-protobuf":
				case "application/vnd.google.protobuf":
				case "application/grpc":
				case "application/grpc+proto":
				case "application/octet-stream": {
					//Console.debug(`$request: ${JSON.stringify($request, null, 2)}`);
	                let rawBody = new Uint8Array($request.body);
					//Console.debug(`isBuffer? ${ArrayBuffer.isView(rawBody)}: ${JSON.stringify(rawBody, null, 2)}`);
					// 写入二进制数据
					$request.body = rawBody;
					break;
				}
			}
		//break; // 不中断，继续处理URL
		case "GET":
		case "HEAD":
		case "OPTIONS":
		default:
			delete $request?.headers?.["If-None-Match"];
			delete $request?.headers?.["if-none-match"];
			// 主机判断
			switch (url.hostname) {
				case "configuration.ls.apple.com":
					// 路径判断
					switch (url.pathname) {
						case "/config/defaults":
							break;
					}
					break;
				case "gspe35-ssl.ls.apple.com":
					switch (url.pathname) {
						case "/config/announcements":
							switch (Settings?.Config?.Announcements?.Environment) {
								case "AUTO":
									break;
								case "CN":
								default:
									url.searchParams.set("environment", "prod-cn");
									break;
								case "XX":
									url.searchParams.set("environment", "prod");
									break;
							}
							break;
						case "/geo_manifest/dynamic/config":
							switch (Settings?.GeoManifest?.Dynamic?.Config?.CountryCode) {
								case "AUTO":
									switch (Caches?.pep?.gcc) {
										default:
											url.searchParams.set("country_code", Caches.pep.gcc);
											break;
										case "CN":
										case undefined:
											url.searchParams.set("country_code", "CN");
											break;
									}
									break;
								default:
									url.searchParams.set("country_code", Settings?.GeoManifest?.Dynamic?.Config?.CountryCode ?? "CN");
									break;
							}
							break;
					}
					break;
			}
			break;
		case "CONNECT":
		case "TRACE":
			break;
	}
	/* 获取响应 */
	const $res = await fetch($request.url, {
        method: $request.method,
        headers: $request.headers,
        body: $request.body,
    });
	globalThis.$response = { 
		status: $res.status,
		headers: Object.fromEntries(new Headers($res.headers).entries()), 
		body: await $res.arrayBuffer(),
	};
	delete $response.headers["content-length"];
	/* 修改响应 */
	FORMAT = ($response.headers?.["Content-Type"] ?? $response.headers?.["content-type"])?.split(";")?.[0];
	Console.info(`FORMAT: ${FORMAT}`);
	const PLATFORM = ["Maps"];
	if (url.searchParams.get("os") === "watchos") PLATFORM.push("Watch");
	Console.info(`PLATFORM: ${PLATFORM}`);
	({ Settings, Caches, Configs } = setENV("iRingo", PLATFORM, database));
	Console.logLevel = Settings.LogLevel;
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
					body = XML.parse(new TextDecoder().decode($response.body));
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
            body = JSON.parse(new TextDecoder().decode($response.body)) ?? "{}";
			Console.debug(`body: ${JSON.stringify(body)}`);
			$response.body = JSON.stringify(body);
			break;
		case "application/protobuf":
		case "application/x-protobuf":
		case "application/vnd.google.protobuf":
		case "application/grpc":
		case "application/grpc+proto":
		case "application/octet-stream": {
            let rawBody = new Uint8Array($response.body);
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
	Object.keys($response.headers).map(k => c.header(k, $response.headers[k]));
    return c.body($response.body);
});
