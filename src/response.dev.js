import { $app, Console, done, Lodash as _, Storage } from "@nsnanocat/util";
import XML from "./XML/XML.mjs";
import database from "./function/database.mjs";
import setENV from "./function/setENV.mjs";
import GEOResourceManifest from "./class/GEOResourceManifest.mjs";
import GEOResourceManifestDownload from "./class/GEOResourceManifestDownload.mjs";
import { BinaryReader, UnknownFieldHandler } from "@protobuf-ts/runtime";
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
(async () => {
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
			//Console.debug(`body: ${body}`);
			break;
		case "application/x-mpegURL":
		case "application/x-mpegurl":
		case "application/vnd.apple.mpegurl":
		case "audio/mpegurl":
			//body = M3U8.parse($response.body);
			//Console.debug(`body: ${JSON.stringify(body)}`);
			//$response.body = M3U8.stringify(body);
			break;
		case "text/xml":
		case "text/html":
		case "text/plist":
		case "application/xml":
		case "application/plist":
		case "application/x-plist":
			// 主机判断
			switch (url.hostname) {
				case "gspe1-ssl.ls.apple.com":
					//body = new DOMParser().parseFromString($response.body, FORMAT);
					// 路径判断
					switch (url.pathname) {
						case "/pep/gcc":
							break;
					}
					//$repsonse.body = new XMLSerializer().serializeToString(body);
					break;
				case "configuration.ls.apple.com":
					//body = await PLISTs("plist2json", $response.body);
					BigInt.prototype.toJSON = function () {
						return this.toString();
					};
					body = XML.parse($response.body);
					Console.debug(`body: ${JSON.stringify(body)}`);
					// 路径判断
					switch (url.pathname) {
						case "/config/defaults": {
							const PLIST = body.plist;
							if (PLIST) {
								// CN
								PLIST["com.apple.GEO"].CountryProviders.CN.ShouldEnableLagunaBeach = true; // XX
								//PLIST["com.apple.GEO"].CountryProviders.CN.DrivingMultiWaypointRoutesEnabled = true; // 驾驶导航途径点
								//PLIST["com.apple.GEO"].CountryProviders.CN.EnableAlberta = false; // CN
								PLIST["com.apple.GEO"].CountryProviders.CN.EnableClientDrapedVectorPolygons = true; // CN
								PLIST["com.apple.GEO"].CountryProviders.CN.GEOAddressCorrectionEnabled = true; // CN
								//delete PLIST["com.apple.GEO"].CountryProviders.CN.GEOBatchSpatialEventLookupMaxParametersCount; // CN
								//delete PLIST["com.apple.GEO"].CountryProviders.CN.GEOBatchSpatialPlaceLookupMaxParametersCount; // CN
								//PLIST["com.apple.GEO"].CountryProviders.CN.LocalitiesAndLandmarksSupported = true; // CN
								//PLIST["com.apple.GEO"].CountryProviders.CN.NavigationShowHeadingKey = true;
								PLIST["com.apple.GEO"].CountryProviders.CN.ODcwM0Y2NTgtOTY2M = false; // CN new
								PLIST["com.apple.GEO"].CountryProviders.CN.POIBusynessDifferentialPrivacy = true; // CN
								PLIST["com.apple.GEO"].CountryProviders.CN.POIBusynessRealTime = true; // CN
								PLIST["com.apple.GEO"].CountryProviders.CN.TransitPayEnabled = true; // 公交支付
								//PLIST["com.apple.GEO"].CountryProviders.CN.WiFiQualityNetworkDisabled = Settings?.Config?.Defaults?.WiFiQualityNetworkDisabled ?? true; // CN
								//PLIST["com.apple.GEO"].CountryProviders.CN.WiFiQualityTileDisabled = Settings?.Config?.Defaults?.WiFiQualityTileDisabled ?? true; // CN
								PLIST["com.apple.GEO"].CountryProviders.CN.SupportsOffline = true; // 支持离线地图
								//PLIST["com.apple.GEO"].CountryProviders.CN.SupportsCarIntegration = true; // 支持 CarPlay 集成
								// TW
								PLIST["com.apple.GEO"].CountryProviders.CN.GEOShouldSpeakWrittenAddresses = true; // TW
								PLIST["com.apple.GEO"].CountryProviders.CN.GEOShouldSpeakWrittenPlaceNames = true; // TW
								// US
								PLIST["com.apple.GEO"].CountryProviders.CN["6694982d2b14e95815e44e970235e230"] = true; // US
								//PLIST["com.apple.GEO"].CountryProviders.CN.PedestrianAREnabled = true; // 现实世界中的线路
								PLIST["com.apple.GEO"].CountryProviders.CN.OpticalHeadingEnabled = true; // 举起以查看
								//PLIST["com.apple.GEO"].CountryProviders.CN.UseCLPedestrianMapMatchedLocations = true; // 导航准确性-增强
								// Public
								PLIST["com.apple.GEO"].Q0FFNUI2QUEtRUU2.push("CN");
								PLIST["com.apple.GEO"].SupportedCountriesCustomRouteCreation.push("CN"); // 支持创建自定义步行或徒步线路
								PLIST["com.apple.GEO"].VisitedPlacesWarmingSheetCountryEnabled.push("CN");
								// mod
								PLIST["com.apple.GEO"].DrivingMultiWaypointRoutesEnabled = true; // 驾驶导航途径点
								PLIST["com.apple.GEO"].LocalitiesAndLandmarksSupported = true; // 支持地名和地标
								PLIST["com.apple.GEO"].NavigationShowHeadingKey = true; // 导航显示方向键?
								PLIST["com.apple.GEO"].SupportsCarIntegration = true; // 支持 CarPlay 集成
								//PLIST["com.apple.GEO"]["6694982d2b14e95815e44e970235e230"] = true; // US
								//PLIST["com.apple.GEO"].PedestrianAREnabled = true; // 现实世界中的线路
								//PLIST["com.apple.GEO"].OpticalHeadingEnabled = true; // 举起以查看
								PLIST["com.apple.GEO"].UseCLPedestrianMapMatchedLocations = true; // 导航准确性-增强
							}
							break;
						}
					}
					Console.debug(`body: ${JSON.stringify(body)}`);
					//$response.body = await PLISTs("json2plist", body); // json2plist
					$response.body = XML.stringify(body);
					break;
			}
			break;
		case "text/vtt":
		case "application/vtt":
			//body = VTT.parse($response.body);
			//Console.debug(`body: ${JSON.stringify(body)}`);
			//$response.body = VTT.stringify(body);
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
			//Console.debug(`$response: ${JSON.stringify($response, null, 2)}`);
			let rawBody = $app === "Quantumult X" ? new Uint8Array($response.bodyBytes ?? []) : ($response.body ?? new Uint8Array());
			//Console.debug(`isBuffer? ${ArrayBuffer.isView(rawBody)}: ${JSON.stringify(rawBody)}`);
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
									//Console.debug(`body before: ${JSON.stringify(body)}`);
									/*
											let UF = UnknownFieldHandler.list(body);
											//Console.debug(`调试信息`, `UF: ${JSON.stringify(UF)}`);
											if (UF) {
												UF = UF.map(uf => {
													uf.no; // 22
													uf.wireType; // WireType.Varint
													// use the binary reader to decode the raw data:
													let reader = new BinaryReader(uf.data);
													let addedNumber = reader.int32(); // 7777
													Console.debug(`no: ${uf.no}, wireType: ${uf.wireType}, reader: ${reader}, addedNumber: ${addedNumber}`);
												});
											};
											*/
									const CountryCode = url.searchParams.get("country_code");
									const ETag = $response.headers?.Etag ?? $response.headers?.etag;
									switch (CountryCode) {
										case "CN": {
											//GEOResourceManifest.cacheResourceManifest(body, Caches, "CN", ETag);
											Caches.CN = body;
											const { ETag: XXETag, body: USBody } = await GEOResourceManifest.downloadResourceManifest($request, "US");
											Caches.XX = GEOResourceManifestDownload.decode(USBody);
											//GEOResourceManifest.cacheResourceManifest(USBody, Caches, "XX", XXETag);
											// announcementsSupportedLanguage
											//body.announcementsSupportedLanguage?.push?.("zh-CN");
											//body.announcementsSupportedLanguage?.push?.("zh-TW");
											break;
										}
										case "KR": {
											//GEOResourceManifest.cacheResourceManifest(body, Caches, "KR", ETag);
											Caches.KR = body;
											const { ETag: CNETag, body: CNBody } = await GEOResourceManifest.downloadResourceManifest($request, "CN");
											Caches.CN = GEOResourceManifestDownload.decode(CNBody);
											//GEOResourceManifest.cacheResourceManifest(CNBody, Caches, "CN", CNETag);
											break;
										}
										default: {
											//GEOResourceManifest.cacheResourceManifest(body, Caches, "XX", ETag);
											Caches.XX = body;
											const { ETag: CNETag, body: CNBody } = await GEOResourceManifest.downloadResourceManifest($request, "CN");
											Caches.CN = GEOResourceManifestDownload.decode(CNBody);
											//GEOResourceManifest.cacheResourceManifest(CNBody, Caches, "CN", CNETag);
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
									// releaseInfo
									//body.releaseInfo = body.releaseInfo.replace(/(\d+\.\d+)/, `$1.${String(Date.now()/1000)}`);
									Console.debug(`releaseInfo: ${body.releaseInfo}`);
									//Console.debug(`body after: ${JSON.stringify(body)}`);
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
