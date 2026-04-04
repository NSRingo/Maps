import { Console, fetch, Storage } from "@nsnanocat/util";
import GEOResourceManifestDownload from "./GEOResourceManifestDownload.mjs";
export default class GEOResourceManifest {
	/**
	 * 下载资源清单二进制。
	 * Download resource manifest binary.
	 * @param {object} request 请求对象 / Request object.
	 * @param {string} countryCode 国家代码 / Country code.
	 * @returns {Promise<{status: number, eTag: string|undefined, body: Uint8Array}>} 下载结果 / Download result.
	 */
	static async download(request = $request, countryCode = "CN") {
		Console.log("☑️ Download");
		const newRequest = { ...request };
		newRequest.url = new URL(newRequest.url);
		newRequest.url.searchParams.set("country_code", countryCode === "XX" ? "US" : countryCode);
		newRequest.url = newRequest.url.toString();
		newRequest["binary-mode"] = true;
		const response = await fetch(newRequest);
		const rawBody = response.bodyBytes ? new Uint8Array(response.bodyBytes) : response.body ?? new Uint8Array();
		Console.log("✅ Download");
		return { status: response.status ?? response.statusCode ?? 0, eTag: response.headers?.Etag ?? response.headers?.etag, body: rawBody };
	}

	/**
	 * 读取资源清单缓存。
	 * Read resource manifest cache.
	 * @param {object} caches 缓存对象 / Cache object.
	 * @param {string} queryString 查询字符串（包含前导问号） / Query string with leading question mark.
	 * @param {object} KV Shared KV storage instance.
	 * @returns {Promise<{eTag?: string, base64?: string}|undefined>} 缓存条目 / Cache entry.
	 */
	static async getCache(caches = {}, queryString = "", KV) {
		Console.log("☑️ Get Cache");
		if (!queryString) {
			Console.error("Get Cache", "Missing query string");
			return undefined;
		}
		let cache;
		if (KV) {
			cache = await KV.getItem(`@iRingo.Maps.Caches.${queryString}`);
			if (typeof cache === "object" && cache !== null) caches[queryString] = cache;
		} else cache = caches?.[queryString];
		switch (typeof cache?.base64) {
			case "string":
				if (cache.base64) {
					Console.log("✅ Get Cache");
					return cache;
				}
				break;
		}
		Console.log("✅ Get Cache");
		return undefined;
	}

	/**
	 * 写入资源清单缓存。
	 * Write resource manifest cache.
	 * @param {object} caches 缓存对象 / Cache object.
	 * @param {string} queryString 查询字符串（包含前导问号） / Query string with leading question mark.
	 * @param {string} eTag 实体标签 / Entity tag.
	 * @param {Uint8Array|ArrayBuffer} rawBody 原始二进制 / Raw binary body.
	 * @param {object} KV Shared KV storage instance.
	 * @returns {Promise<boolean>} 是否写入成功 / Whether cache is written.
	 */
	static async setCache(caches = {}, queryString = "", eTag = "", rawBody = new Uint8Array(), KV) {
		Console.log("☑️ Set Cache");
		if (!queryString) {
			Console.error("Set Cache", "Missing query string");
			return false;
		}
		if (!eTag) {
			Console.error("Set Cache", `Missing eTag: ${queryString}`);
			return false;
		}
		rawBody = rawBody instanceof Uint8Array ? rawBody : new Uint8Array(rawBody ?? []);
		if (!rawBody.length) {
			Console.error("Set Cache", `Empty body: ${queryString}`);
			return false;
		}
		let base64 = "";
		try {
			switch (true) {
				case typeof globalThis.Buffer !== "undefined":
					base64 = globalThis.Buffer.from(rawBody.buffer, rawBody.byteOffset, rawBody.byteLength).toString("base64");
					break;
				case typeof globalThis.btoa === "function": {
					const chunks = [];
					for (let index = 0; index < rawBody.length; index += 0x2000) {
						const chunk = rawBody.subarray(index, index + 0x2000);
						let binary = "";
						for (const byte of chunk) binary += String.fromCharCode(byte);
						chunks.push(binary);
					}
					base64 = globalThis.btoa(chunks.join(""));
					break;
				}
				default:
					throw new Error("Unsupported base64 encoder");
			}
		} catch (error) {
			Console.error(error);
			Console.error("Set Cache", `Encode failed: ${queryString}`);
			return false;
		}
		if (!base64) {
			Console.error("Set Cache", `Empty base64: ${queryString}`);
			return false;
		}
		let result;
		if (KV) result = await KV.setItem(`@iRingo.Maps.Caches.${queryString}`, { eTag, base64 });
		else {
			caches = {};
			caches[queryString] = { eTag, base64 };
			result = Storage.setItem("@iRingo.Maps.Caches", caches);
		}
		Console.log("✅ Set Cache");
		return result;
	}

	/**
	 * 解码资源清单缓存。
	 * Decode resource manifest cache.
	 * @param {object} caches 缓存对象 / Cache object.
	 * @param {string} queryString 查询字符串（包含前导问号） / Query string with leading question mark.
	 * @param {object} KV Shared KV storage instance.
	 * @returns {Promise<object|undefined>} 解码结果 / Decoded manifest.
	 */
	static async decodeCache(caches = {}, queryString = "", KV) {
		Console.log("☑️ Decode Cache");
		const cache = await GEOResourceManifest.getCache(caches, queryString, KV);
		if (!cache?.base64) {
			Console.error("Decode Cache", `Missing cache: ${queryString}`);
			return undefined;
		}
		try {
			let rawBody;
			switch (true) {
				case typeof globalThis.Buffer !== "undefined":
					rawBody = new Uint8Array(globalThis.Buffer.from(cache.base64, "base64"));
					break;
				case typeof globalThis.atob === "function": {
					const binary = globalThis.atob(cache.base64);
					rawBody = new Uint8Array(binary.length);
					for (let index = 0; index < binary.length; index++) rawBody[index] = binary.charCodeAt(index);
					break;
				}
				default:
					throw new Error("Unsupported base64 decoder");
			}
			if (!rawBody?.length) {
				Console.error("Decode Cache", `Empty body: ${queryString}`);
				return undefined;
			}
			const body = GEOResourceManifestDownload.decode(rawBody);
			Console.log("✅ Decode Cache");
			return body;
		} catch (error) {
			Console.error(error);
			Console.error("Decode Cache", `Decode failed: ${queryString}`);
			return undefined;
		}
	}

	static tileSets(tileSet = [], caches = {}, settings = {}, countryCode = "CN") {
		Console.log("☑️ Set TileSets");
		//let tileNames = [];
		//caches.XX.tileSet.forEach(tile => tileNames.push(tile.style));
		//caches.CN.tileSet.forEach(tile => tileNames.push(tile.style));
		//tileNames = [...new Set(tileNames)];
		// 填补空缺图源
		switch (countryCode) {
			case "CN":
				/*
                // 填补数据组
                caches.CN.tileSet = caches.CN.tileSet.map(tile => {
                    tile.dataSet = 0;
                    return tile;
                });
                */
				caches.XX.tileSet.forEach(tile => {
					if (!caches.CN.tileSet.some(i => i.style === tile.style)) {
						Console.warn(`Missing style: ${tile?.style}`);
						tileSet.push(tile);
					}
				});
				break;
			case "KR":
			default:
				caches.CN.tileSet.forEach(tile => {
					if (!caches.XX.tileSet.some(i => i.style === tile.style)) {
						//Console.warn(`Missing style: ${tile?.style}`);
						//tile.dataSet = 0; // 填补数据组
						tileSet.push(tile);
					}
				});
				break;
		}
		// 按需更改图源
		tileSet = tileSet
			.map((tile, index) => {
				switch (tile.style) {
					/*
					case "VECTOR_STANDARD": // 1 标准地图
					case "RASTER_TERRAIN": // 8 地貌与地势（绿地/城市/水体/山地不同颜色的区域）
					case "VECTOR_BUILDINGS": // 11 建筑模型（3D/白模）
					case "VECTOR_ROADS": // 20 道路（卫星地图:显示标签）
					case "VECTOR_VENUES": // 30 室内地图
					case "VECTOR_TRANSIT": // 37 公共交通
					case "VECTOR_ROAD_NETWORK": // 53 道路网络
					case "VECTOR_TRANSIT_SELECTION": // 47 公共交通选区?
					case "VECTOR_STREET_LANDMARKS": // 64 街道地标?
					case "VECTOR_BUILDINGS_V2": // 73 建筑模型V2（3D/上色）
						Console.info(`Basic style: ${tile?.style}`);
						tile = caches?.XX?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale && i.size === tile.size && i.dataSet === tile.dataSet)) || caches?.XX?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale && i.dataSet === tile.dataSet)) || caches?.XX?.tileSet?.find(i => (i.style === tile.style && i.dataSet === tile.dataSet)) || tile;
						Console.info(`Basic baseURL: ${tile?.baseURL}`);
						break;
					*/
					case "RASTER_SATELLITE": // 7 卫星地图（2D）
					case "RASTER_SATELLITE_NIGHT": // 33 卫星地图（2D/夜间）
					case "RASTER_SATELLITE_DIGITIZE": // 35 卫星地图（2D/数字化）
					case "RASTER_SATELLITE_ASTC": // 45 卫星地图（2D/ASTC）
					case "RASTER_SATELLITE_POLAR": // 91 卫星地图（2D/极地）
					case "RASTER_SATELLITE_POLAR_NIGHT": // 95 卫星地图（2D/极地/夜间）
						Console.info(`Satellite style: ${tile?.style}`);
						switch (settings.TileSet.Satellite) {
							case "HYBRID":
							default:
								break;
							case "CN":
								tile = caches?.CN?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.size === tile.size) || caches?.CN?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale) || caches?.CN?.tileSet?.find(i => i.style === tile.style) || tile;
								break;
							case "XX":
								switch (typeof tile.dataSet) {
									case "undefined":
										tile = caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.size === tile.size) || caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale) || caches?.XX?.tileSet?.find(i => i.style === tile.style) || tile;
										break;
									case "number":
										tile =
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.size === tile.size && i.dataSet === tile.dataSet) ||
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.dataSet === tile.dataSet) ||
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.dataSet === tile.dataSet) ||
											tile;
										break;
								}
								break;
						}
						Console.info(`Satellite baseURL: ${tile?.baseURL}`);
						Console.debug(`Satellite tile: ${JSON.stringify(tile, null, 2)}`);
						break;
					/*
					case "VECTOR_TRAFFIC_SEGMENTS_FOR_RASTER": // 2 交通状况分段（卫星地图:显示交通状况）?
					case "VECTOR_TRAFFIC_INCIDENTS_FOR_RASTER": // 3 交通状况事件（卫星地图:显示交通状况）?
					case "VECTOR_TRAFFIC_SEGMENTS_AND_INCIDENTS_FOR_RASTER": // 4 交通状况分段和事件（卫星地图:显示交通状况）?
					case "VECTOR_TRAFFIC": // 12 交通状况
					case "VECTOR_TRAFFIC_SKELETON": // 22 交通状况骨架（卫星地图:显示交通状况）
					case "VECTOR_TRAFFIC_WITH_GREEN": // 25 交通状况（卫星地图:显示绿灯）?
					case "VECTOR_TRAFFIC_STATIC": // 26 交通状况静态?
					case "VECTOR_TRAFFIC_SKELETON_WITH_HISTORICAL": // 28 交通状况骨架（卫星地图:显示历史交通状况）?
					case "VECTOR_TRAFFIC_V2": // 86 交通状况V2
						Console.info(`Traffic style: ${tile?.style}`);
						switch (settings.TileSet.Traffic) {
							case "HYBRID":
							default:
								break;
							case "CN":
								tile = caches?.CN?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.size === tile.size) || caches?.CN?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale) || caches?.CN?.tileSet?.find(i => i.style === tile.style) || tile;
								break;
							case "XX":
								switch (typeof tile.dataSet) {
									case "undefined":
										tile =
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.size === tile.size) ||
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale) ||
											caches?.XX?.tileSet?.find(i => i.style === tile.style) ||
											tile;
										break;
									case "number":
										tile =
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.size === tile.size && i.dataSet === tile.dataSet) ||
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.dataSet === tile.dataSet) ||
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.dataSet === tile.dataSet) ||
											tile;
										break;
								}
								break;
						}
						//Console.info(`Traffic baseURL: ${tile?.baseURL}`);
						//break;
					*/
					/*
					case "VECTOR_POI": // 13 兴趣点
					case "VECTOR_STREET_POI": // 56 街道兴趣点
					case "VECTOR_POI_V2": // 68 兴趣点V2
					case "VECTOR_POLYGON_SELECTION": // 69 多边形选区（兴趣点）
					case "POI_BUSYNESS": // 74 兴趣点繁忙程度?
					case "POI_DP_BUSYNESS": // 75 兴趣点DP繁忙程度?
					case "VECTOR_POI_V2_UPDATE": // 84 兴趣点V2更新
						Console.info(`POI style: ${tile?.style}`);
						switch (settings.TileSet.POI) {
							case "HYBRID":
							default:
								break;
							case "CN":
								tile = caches?.CN?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.size === tile.size) || caches?.CN?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale) || caches?.CN?.tileSet?.find(i => i.style === tile.style) || tile;
								break;
							case "XX":
								switch (typeof tile.dataSet) {
									case "undefined":
										tile =
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.size === tile.size) ||
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale) ||
											caches?.XX?.tileSet?.find(i => i.style === tile.style) ||
											tile;
										break;
									case "number":
										tile =
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.size === tile.size && i.dataSet === tile.dataSet) ||
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.dataSet === tile.dataSet) ||
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.dataSet === tile.dataSet) ||
											tile;
										break;
								}
								break;
						}
						Console.info(`POI baseURL: ${tile?.baseURL}`);
						break;
					*/
					/*
					case "SPUTNIK_METADATA": // 14 卫星地图（3D/俯瞰）元数据
					case "SPUTNIK_C3M": // 15 卫星地图（3D/俯瞰）C3模型
					case "SPUTNIK_DSM": // 16 卫星地图（3D/俯瞰）数字表面模型
					case "SPUTNIK_DSM_GLOBAL": // 17 卫星地图（3D/俯瞰）全球数字表面模型
						Console.info(`Satellite style: ${tile?.style}`);
						switch (settings.TileSet.Satellite) {
							case "HYBRID":
							default:
								break;
							case "CN":
								tile = caches?.CN?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.size === tile.size) || caches?.CN?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale) || caches?.CN?.tileSet?.find(i => i.style === tile.style) || tile;
								break;
							case "XX":
								switch (typeof tile.dataSet) {
									case "undefined":
										tile =
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.size === tile.size) ||
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale) ||
											caches?.XX?.tileSet?.find(i => i.style === tile.style) ||
											tile;
										break;
									case "number":
										tile =
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.size === tile.size && i.dataSet === tile.dataSet) ||
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.dataSet === tile.dataSet) ||
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.dataSet === tile.dataSet) ||
											tile;
										break;
								}
								break;
						}
						Console.info(`Satellite baseURL: ${tile?.baseURL}`);
						Console.debug(`Satellite tile: ${JSON.stringify(tile, null, 2)}`);
						break;
					*/
					/*
					case "SPUTNIK_VECTOR_BORDER": // 34 卫星地图（3D/俯瞰）边界（决定能否显示地球模型）
						Console.info(`Satellite style: ${tile?.style}`);
						switch ("HYBRID" ?? settings.TileSet.Satellite) {
							case "CN":
								tile = caches?.CN?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.size === tile.size) || caches?.CN?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale) || caches?.CN?.tileSet?.find(i => i.style === tile.style) || tile;
								break;
							case "HYBRID":
							case "XX":
							default:
								switch (typeof tile.dataSet) {
									case "undefined":
										tile =
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.size === tile.size) ||
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale) ||
											caches?.XX?.tileSet?.find(i => i.style === tile.style) ||
											tile;
										break;
									case "number":
										tile =
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.size === tile.size && i.dataSet === tile.dataSet) ||
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.dataSet === tile.dataSet) ||
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.dataSet === tile.dataSet) ||
											tile;
										break;
								}
								break;
						}
						Console.info(`Satellite baseURL: ${tile?.baseURL}`);
						Console.debug(`Satellite tile: ${JSON.stringify(tile, null, 2)}`);
						break;
					*/
					case "FLYOVER_C3M_MESH": // 42 俯瞰C3模型（四处看看）?
					case "FLYOVER_C3M_JPEG_TEXTURE": // 43 俯瞰C3模型纹理（四处看看）?
					case "FLYOVER_C3M_ASTC_TEXTURE": // 44 俯瞰C3模型纹理（四处看看）?
						Console.info(`Flyover style: ${tile?.style}`);
						switch (settings.TileSet.Flyover) {
							case "HYBRID":
								break;
							case "CN":
								tile = caches?.CN?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.size === tile.size) || caches?.CN?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale) || caches?.CN?.tileSet?.find(i => i.style === tile.style) || tile;
								break;
							case "XX":
							default:
								switch (typeof tile.dataSet) {
									case "undefined":
										tile = caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.size === tile.size) || caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale) || caches?.XX?.tileSet?.find(i => i.style === tile.style) || tile;
										break;
									case "number":
										tile =
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.size === tile.size && i.dataSet === tile.dataSet) ||
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.dataSet === tile.dataSet) ||
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.dataSet === tile.dataSet) ||
											tile;
										break;
								}
								break;
						}
						Console.info(`Flyover baseURL: ${tile?.baseURL}`);
						Console.debug(`Flyover tile: ${JSON.stringify(tile, null, 2)}`);
						break;
					case "FLYOVER_VISIBILITY": // 49 俯瞰可见性（四处看看）?
					case "FLYOVER_SKYBOX": // 50 俯瞰天空盒（四处看看）?
					case "FLYOVER_NAVGRAPH": // 51 俯瞰导航图（四处看看）?
						Console.info(`Flyover style: ${tile?.style}`);
						switch (settings.TileSet.Flyover) {
							case "CN":
								tile = caches?.CN?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.size === tile.size) || caches?.CN?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale) || caches?.CN?.tileSet?.find(i => i.style === tile.style) || tile;
								break;
							case "HYBRID":
							case "XX":
							default:
								switch (typeof tile.dataSet) {
									case "undefined":
										tile = caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.size === tile.size) || caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale) || caches?.XX?.tileSet?.find(i => i.style === tile.style) || tile;
										break;
									case "number":
										tile =
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.size === tile.size && i.dataSet === tile.dataSet) ||
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.dataSet === tile.dataSet) ||
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.dataSet === tile.dataSet) ||
											tile;
										break;
								}
								break;
						}
						Console.info(`Flyover baseURL: ${tile?.baseURL}`);
						Console.debug(`Flyover tile: ${JSON.stringify(tile, null, 2)}`);
						break;
					case "FLYOVER_METADATA": // 52 俯瞰元数据
						Console.info(`Flyover style: ${tile?.style}`);
						switch (settings.TileSet.Flyover) {
							case "HYBRID":
								break;
							case "CN":
								tile = caches?.CN?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.size === tile.size) || caches?.CN?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale) || caches?.CN?.tileSet?.find(i => i.style === tile.style) || tile;
								break;
							case "XX":
							default:
								switch (typeof tile.dataSet) {
									case "undefined":
										tile = caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.size === tile.size) || caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale) || caches?.XX?.tileSet?.find(i => i.style === tile.style) || tile;
										break;
									case "number":
										tile =
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.size === tile.size && i.dataSet === tile.dataSet) ||
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.dataSet === tile.dataSet) ||
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.dataSet === tile.dataSet) ||
											tile;
										break;
								}
								break;
						}
						Console.info(`Flyover baseURL: ${tile?.baseURL}`);
						Console.debug(`Flyover tile: ${JSON.stringify(tile, null, 2)}`);
						break;
					case "MUNIN_METADATA": // 57 四处看看 元数据
						Console.info(`Munin style: ${tile?.style}`);
						switch (settings.TileSet.Munin) {
							case "CN":
								tile = caches?.CN?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.size === tile.size) || caches?.CN?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale) || caches?.CN?.tileSet?.find(i => i.style === tile.style) || tile;
								break;
							case "HYBRID":
							case "XX":
							default:
								switch (typeof tile.dataSet) {
									case "undefined":
										tile = caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.size === tile.size) || caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale) || caches?.XX?.tileSet?.find(i => i.style === tile.style) || tile;
										break;
									case "number":
										tile =
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.size === tile.size && i.dataSet === tile.dataSet) ||
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.dataSet === tile.dataSet) ||
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.dataSet === tile.dataSet) ||
											tile;
										break;
								}
								break;
						}
						Console.info(`Munin baseURL: ${tile?.baseURL}`);
						Console.debug(`Munin tile: ${JSON.stringify(tile, null, 2)}`);
						break;
					case "VECTOR_SPR_MERCATOR": // 58
					case "VECTOR_SPR_MODELS": // 59
					case "VECTOR_SPR_MATERIALS": // 60
					case "VECTOR_SPR_METADATA": // 61
						Console.info(`SPR style: ${tile?.style}`);
						Console.info(`SPR baseURL: ${tile?.baseURL}`);
						Console.debug(`SPR tile: ${JSON.stringify(tile, null, 2)}`);
						break;
					case "VECTOR_SPR_ROADS": // 66 (卫星图下的道路网格和四处看看可用性)
						Console.info(`Roads style: ${tile?.style}`);
						switch (settings.TileSet.Roads) {
							case "CN":
								tile = caches?.CN?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.size === tile.size) || caches?.CN?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale) || caches?.CN?.tileSet?.find(i => i.style === tile.style) || tile;
								break;
							default:
							case "XX":
							case "HYBRID":
								switch (typeof tile.dataSet) {
									case "undefined":
										tile =
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.size === tile.size) ||
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.size === tile.size) ||
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale) ||
											caches?.XX?.tileSet?.find(i => i.style === tile.style) ||
											tile;
										break;
									case "number":
										tile =
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.size === tile.size && i.dataSet === tile.dataSet) ||
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.size === tile.size && i.dataSet === tile.dataSet) ||
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.dataSet === tile.dataSet) ||
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.dataSet === tile.dataSet) ||
											tile;
										break;
								}
								break;
						}
						Console.info(`Roads baseURL: ${tile?.baseURL}`);
						Console.debug(`Roads tile: ${JSON.stringify(tile, null, 2)}`);
						break;
					case "VECTOR_SPR_STANDARD": // 67 (影响 1-6 级视图下的行政区域名称与资料显示版本)
						Console.info(`Earth style: ${tile?.style}`);
						switch (settings.TileSet.Earth) {
							default:
							case "HYBRID":
							case "AutoNavi":
								tile = caches?.CN?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.size === tile.size) || caches?.CN?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale) || caches?.CN?.tileSet?.find(i => i.style === tile.style) || tile;
								break;
							case "Apple":
								switch (typeof tile.dataSet) {
									case "undefined":
										tile = caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.size === tile.size) || caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale) || caches?.XX?.tileSet?.find(i => i.style === tile.style) || tile;
										break;
									case "number":
										tile =
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.size === tile.size && i.dataSet === tile.dataSet) ||
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.scale === tile.scale && i.dataSet === tile.dataSet) ||
											caches?.XX?.tileSet?.find(i => i.style === tile.style && i.dataSet === tile.dataSet) ||
											tile;
										break;
								}
								break;
						}
						Console.info(`Earth baseURL: ${tile?.baseURL}`);
						Console.debug(`Earth tile: ${JSON.stringify(tile, null, 2)}`);
						break;
					case "SPR_ASSET_METADATA": // 78? (排除)
					case "VECTOR_SPR_POLAR": // 79
					case "VECTOR_SPR_MODELS_OCCLUSION": // 82? (排除)
						Console.info(`SPR style: ${tile?.style}`);
						Console.info(`SPR baseURL: ${tile?.baseURL}`);
						Console.debug(`SPR tile: ${JSON.stringify(tile, null, 2)}`);
						break;
					/*
					case "VECTOR_REALISTIC": // 18 逼真地图?
					case "VECTOR_COVERAGE": // 48 覆盖范围?
					case "VECTOR_LAND_COVER": // 54 土地覆盖?
					case "SMART_DATA_MODE": // 80 智能数据模式?
					case "VECTOR_TOPOGRAPHIC": // 83 地形图?
					case "VECTOR_ROAD_SELECTION": // 87 道路选区?
					case "VECTOR_REGION_METADATA": // 88 区域元数据?
						Console.info(`TEST style: ${tile?.style}`);
						tile = caches?.XX?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale && i.size === tile.size && i.dataSet === tile.dataSet)) || caches?.XX?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale && i.dataSet === tile.dataSet)) || caches?.XX?.tileSet?.find(i => (i.style === tile.style && i.dataSet === tile.dataSet)) || tile;
						Console.info(`TEST baseURL: ${tile?.baseURL}`);
						break;
					*/
					/*
					case "VECTOR_TRACKS": // 62 轨道?
					case "COARSE_LOCATION_POLYGONS": // 65 粗略位置多边形?
					case "VL_METADATA": // 70 VL 元数据?
					case "VL_DATA": // 71 VL 数据?
					case "PROACTIVE_APP_CLIP": // 72 主动式App剪辑?
					case "SMART_INTERFACE_SELECTION": // 76 智能界面选区?
					case "VECTOR_LIVE_DATA_UPDATES": // 85 实时数据更新?
					case "RAY_TRACING": // 89 光线追踪?
					case "VECTOR_CONTOURS": // 90 等高线?
					case "VMAP4_ELEVATION": // 92 VMAP4 高程?
					case "VMAP4_ELEVATION_POLAR": // 93 VMAP4 高程（极地）?
					case "CELLULAR_COVERAGE_PLMN": // 94 蜂窝覆盖 PLMN?
					case "UNUSED_99": // 99 未使用
						break;
					*/
					default:
						Console.info(`default style: ${tile?.style}`);
						/*
                        switch (countryCode) {
                            case "CN":
                                tile = caches?.XX?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale && i.size === tile.size && i.dataSet === tile.dataSet)) || caches?.XX?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale && i.dataSet === tile.dataSet)) || caches?.XX?.tileSet?.find(i => (i.style === tile.style && i.dataSet === tile.dataSet)) || tile;
                                break;
                            case "KR":
                            default:
                                tile = caches?.CN?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale && i.size === tile.size)) || caches?.CN?.tileSet?.find(i => (i.style === tile.style && i.scale === tile.scale)) || caches?.CN?.tileSet?.find(i => (i.style === tile.style)) || tile;
                                break;
                        };
                        */
						Console.info(`default baseURL: ${tile?.baseURL}`);
						Console.debug(`default tile: ${JSON.stringify(tile, null, 2)}`);
						break;
				}
				return tile;
			})
			.flat(Number.POSITIVE_INFINITY)
			.filter(Boolean);
		Console.log("✅ Set TileSets");
		return tileSet;
	}

	static attributions(attributions = [], caches = {}, countryCode = "CN") {
		Console.log("☑️ Set Attributions");
		switch (countryCode) {
			case "CN":
				caches?.XX?.attribution?.forEach(attribution => {
					if (!attributions.some(i => i.name === attribution.name)) attributions.unshift(attribution);
				});
				break;
			case "KR":
				caches?.KR?.attribution?.forEach(attribution => {
					if (!attributions.some(i => i.name === attribution.name)) attributions.unshift(attribution);
				});
				break;
			default:
				caches?.CN?.attribution?.forEach(attribution => {
					if (!attributions.some(i => i.name === attribution.name)) attributions.push(attribution);
				});
				break;
		}
		attributions.sort((a, b) => {
			switch (a.name) {
				case "‎":
					return -1;
				case "AutoNavi":
					return 0;
				default:
					return 1;
			}
		});
		attributions = attributions
			.map((attribution, index) => {
				switch (attribution.name) {
					case "‎":
						attribution.name = ` iRingo: 📍 GEOResourceManifest\n${new Date()}`;
						delete attribution.plainTextURLSHA256Checksum;
						break;
					case "AutoNavi":
						attribution.resource = attribution.resource?.filter(i => i.resourceType !== 6);
						attribution.region = [
							{ minX: 214, minY: 82, maxX: 216, maxY: 82, minZ: 8, maxZ: 21 },
							{ minX: 213, minY: 83, maxX: 217, maxY: 83, minZ: 8, maxZ: 21 },
							{ minX: 213, minY: 84, maxX: 218, maxY: 84, minZ: 8, maxZ: 21 },
							{ minX: 213, minY: 85, maxX: 218, maxY: 85, minZ: 8, maxZ: 21 },
							{ minX: 212, minY: 86, maxX: 218, maxY: 86, minZ: 8, maxZ: 21 },
							{ minX: 189, minY: 87, maxX: 190, maxY: 87, minZ: 8, maxZ: 21 },
							{ minX: 210, minY: 87, maxX: 220, maxY: 87, minZ: 8, maxZ: 21 },
							{ minX: 188, minY: 88, maxX: 191, maxY: 88, minZ: 8, maxZ: 21 },
							{ minX: 210, minY: 88, maxX: 223, maxY: 88, minZ: 8, maxZ: 21 },
							{ minX: 188, minY: 89, maxX: 192, maxY: 89, minZ: 8, maxZ: 21 },
							{ minX: 210, minY: 89, maxX: 223, maxY: 89, minZ: 8, maxZ: 21 },
							{ minX: 186, minY: 90, maxX: 192, maxY: 90, minZ: 8, maxZ: 21 },
							{ minX: 210, minY: 90, maxX: 223, maxY: 90, minZ: 8, maxZ: 21 },
							{ minX: 209, minY: 91, maxX: 222, maxY: 91, minZ: 8, maxZ: 21 },
							{ minX: 186, minY: 91, maxX: 192, maxY: 91, minZ: 8, maxZ: 21 },
							{ minX: 184, minY: 92, maxX: 195, maxY: 92, minZ: 8, maxZ: 21 },
							{ minX: 207, minY: 92, maxX: 221, maxY: 92, minZ: 8, maxZ: 21 },
							{ minX: 185, minY: 93, maxX: 196, maxY: 93, minZ: 8, maxZ: 21 },
							{ minX: 206, minY: 93, maxX: 221, maxY: 93, minZ: 8, maxZ: 21 },
							{ minX: 185, minY: 94, maxX: 200, maxY: 94, minZ: 8, maxZ: 21 },
							{ minX: 203, minY: 94, maxX: 221, maxY: 94, minZ: 8, maxZ: 21 },
							{ minX: 182, minY: 94, maxX: 219, maxY: 95, minZ: 8, maxZ: 21 },
							{ minX: 180, minY: 96, maxX: 217, maxY: 96, minZ: 8, maxZ: 21 },
							{ minX: 180, minY: 97, maxX: 216, maxY: 97, minZ: 8, maxZ: 21 },
							{ minX: 180, minY: 98, maxX: 214, maxY: 98, minZ: 8, maxZ: 21 },
							{ minX: 180, minY: 99, maxX: 215, maxY: 99, minZ: 8, maxZ: 21 },
							{ minX: 182, minY: 100, maxX: 214, maxY: 100, minZ: 8, maxZ: 21 },
							{ minX: 183, minY: 101, maxX: 213, maxY: 101, minZ: 8, maxZ: 21 },
							{ minX: 184, minY: 102, maxX: 214, maxY: 102, minZ: 8, maxZ: 21 },
							{ minX: 183, minY: 103, maxX: 214, maxY: 103, minZ: 8, maxZ: 21 },
							{ minX: 184, minY: 104, maxX: 215, maxY: 104, minZ: 8, maxZ: 21 },
							{ minX: 185, minY: 105, maxX: 215, maxY: 105, minZ: 8, maxZ: 21 },
							{ minX: 187, minY: 106, maxX: 215, maxY: 106, minZ: 8, maxZ: 21 },
							{ minX: 189, minY: 107, maxX: 193, maxY: 107, minZ: 8, maxZ: 21 },
							{ minX: 197, minY: 107, maxX: 214, maxY: 107, minZ: 8, maxZ: 21 },
							{ minX: 198, minY: 108, maxX: 214, maxY: 108, minZ: 8, maxZ: 21 },
							{ minX: 110, minY: 109, maxX: 214, maxY: 109, minZ: 8, maxZ: 21 },
							{ minX: 197, minY: 110, maxX: 214, maxY: 110, minZ: 8, maxZ: 21 },
							{ minX: 198, minY: 111, maxX: 214, maxY: 111, minZ: 8, maxZ: 21 },
							{ minX: 204, minY: 112, maxX: 209, maxY: 112, minZ: 8, maxZ: 21 },
							{ minX: 213, minY: 112, maxX: 214, maxY: 112, minZ: 8, maxZ: 21 },
							{ minX: 205, minY: 113, maxX: 207, maxY: 113, minZ: 8, maxZ: 21 },
							{ minX: 205, minY: 114, maxX: 206, maxY: 114, minZ: 8, maxZ: 21 },
							{ minX: 204, minY: 115, maxX: 212, maxY: 128, minZ: 8, maxZ: 21 },
						];
						break;
				}
				return attribution;
			})
			.flat(Number.POSITIVE_INFINITY)
			.filter(Boolean);
		Console.log("✅ Set Attributions");
		return attributions;
	}

	static resources(resources = [], caches = {}, countryCode = "CN") {
		Console.log("☑️ Set Resources");
		switch (countryCode) {
			case "CN":
				break;
			case "KR":
			default:
				caches.CN.resource?.forEach((resource, index) => {
					if (resource.filename === "POITypeMapping-CN-1.json") resources.push(resource);
					if (resource.filename === "POITypeMapping-CN-2.json") resources.push(resource);
					if (resource.filename === "China.cms-lpr") resources.push(resource);
				});
				break;
		}
		Console.log("✅ Set Resources");
		return resources;
	}

	static dataSets(dataSets = [], caches = {}, countryCode = "CN") {
		Console.log("☑️ Set DataSets");
		switch (countryCode) {
			case "CN":
				dataSets = caches?.XX?.dataSet;
				break;
			case "KR":
			default:
				break;
		}
		//dataSets.push({ "dataSetDescription": "AutoNavi", "identifier": 10 });
		Console.log("✅ Set DataSets");
		return dataSets;
	}

	static urlInfoSets(urlInfoSets = [], caches = {}, settings = {}, countryCode = "CN") {
		Console.log("☑️ Set UrlInfoSets");
		urlInfoSets = urlInfoSets.map((urlInfoSet, index) => {
			switch (countryCode) {
				case "CN":
					urlInfoSet = { ...caches.XX.urlInfoSet[0], ...caches.CN.urlInfoSet[0] };
					break;
				case "KR":
					urlInfoSet = { ...caches.KR.urlInfoSet[0], ...caches.CN.urlInfoSet[0] };
					break;
				default:
					urlInfoSet = { ...caches.CN.urlInfoSet[0], ...caches.XX.urlInfoSet[0] };
					urlInfoSet.alternateResourcesURL = caches.CN.urlInfoSet[0].alternateResourcesURL;
					delete urlInfoSet.polyLocationShiftURL;
					break;
			}
			switch (settings.Config?.Announcements?.Environment ?? settings.Config?.Announcements?.["Environment:"]?.default ?? settings.Config?.Announcements?.["Environment:"]) {
				case "AUTO":
				default:
					break;
				case "CN":
					// Announcements
					urlInfoSet.announcementsURL = caches.CN.urlInfoSet[0].announcementsURL;
					break;
				case "XX":
					// Announcements
					urlInfoSet.announcementsURL = caches.XX.urlInfoSet[0].announcementsURL;
					break;
			}
			switch (settings.UrlInfoSet.Dispatcher) {
				case "AUTO":
				default:
					break;
				case "AutoNavi":
					// PlaceData Dispatcher
					urlInfoSet.directionsURL = caches.CN.urlInfoSet[0].dispatcherURL;
					// Background Dispatcher
					urlInfoSet.backgroundDispatcherURL = caches.CN.urlInfoSet[0].backgroundDispatcherURL;
					// Background Reverse Geocoder
					urlInfoSet.backgroundRevGeoURL = caches.CN.urlInfoSet[0].backgroundRevGeoURL;
					// Batch Reverse Geocoder
					urlInfoSet.batchReverseGeocoderPlaceRequestURL = caches.CN.urlInfoSet[0].batchReverseGeocoderPlaceRequestURL;
					break;
				case "Apple":
					// PlaceData Dispatcher
					urlInfoSet.dispatcherURL = caches.XX.urlInfoSet[0].dispatcherURL;
					// Background Dispatcher
					urlInfoSet.backgroundDispatcherURL = caches.XX.urlInfoSet[0].backgroundDispatcherURL;
					// Background Reverse Geocoder
					urlInfoSet.backgroundRevGeoURL = caches.XX.urlInfoSet[0].backgroundRevGeoURL;
					// Batch Reverse Geocoder
					urlInfoSet.batchReverseGeocoderPlaceRequestURL = caches.XX.urlInfoSet[0].batchReverseGeocoderPlaceRequestURL;
					break;
			}
			switch (settings.UrlInfoSet.Directions) {
				case "AUTO":
				default:
					break;
				case "AutoNavi":
					// Directions
					urlInfoSet.directionsURL = caches.CN.urlInfoSet[0].directionsURL;
					// ETA
					urlInfoSet.etaURL = caches.CN.urlInfoSet[0].etaURL;
					// Simple ETA
					urlInfoSet.simpleETAURL = caches.CN.urlInfoSet[0].simpleETAURL;
					break;
				case "Apple":
					// Directions
					urlInfoSet.directionsURL = caches.XX.urlInfoSet[0].directionsURL;
					// ETA
					urlInfoSet.etaURL = caches.XX.urlInfoSet[0].etaURL;
					// Simple ETA
					urlInfoSet.simpleETAURL = caches.XX.urlInfoSet[0].simpleETAURL;
					break;
			}
			switch (settings.UrlInfoSet.RAP) {
				case "AUTO":
				default:
					// RAP Submission
					urlInfoSet.problemSubmissionURL = caches.XX.urlInfoSet[0].problemSubmissionURL;
					// RAP Status
					urlInfoSet.problemStatusURL = caches.XX.urlInfoSet[0].problemStatusURL;
					// RAP Opt-Ins
					urlInfoSet.problemOptInURL = caches.XX.urlInfoSet[0].problemOptInURL;
					// RAP V4 Submission
					urlInfoSet.feedbackSubmissionURL = caches.XX.urlInfoSet[0].feedbackSubmissionURL;
					// RAP V4 Lookup
					urlInfoSet.feedbackLookupURL = caches.XX.urlInfoSet[0].feedbackLookupURL;
					break;
				case "AutoNavi":
					// RAP Submission
					urlInfoSet.problemSubmissionURL = caches.CN.urlInfoSet[0].problemSubmissionURL;
					// RAP Status
					urlInfoSet.problemStatusURL = caches.CN.urlInfoSet[0].problemStatusURL;
					// RAP V4 Submission
					urlInfoSet.feedbackSubmissionURL = caches.CN.urlInfoSet[0].feedbackSubmissionURL;
					// RAP V4 Lookup
					urlInfoSet.feedbackLookupURL = caches.CN.urlInfoSet[0].feedbackLookupURL;
					break;
				case "Apple":
					// RAP Submission
					urlInfoSet.problemSubmissionURL = caches.XX.urlInfoSet[0].problemSubmissionURL;
					// RAP Status
					urlInfoSet.problemStatusURL = caches.XX.urlInfoSet[0].problemStatusURL;
					// RAP Opt-Ins
					urlInfoSet.problemOptInURL = caches.XX.urlInfoSet[0].problemOptInURL;
					// RAP V4 Submission
					urlInfoSet.feedbackSubmissionURL = caches.XX.urlInfoSet[0].feedbackSubmissionURL;
					// RAP V4 Lookup
					urlInfoSet.feedbackLookupURL = caches.XX.urlInfoSet[0].feedbackLookupURL;
					break;
			}
			switch (settings.UrlInfoSet.LocationShift) {
				case "AUTO":
				default:
					break;
				case "AutoNavi":
					// Location Shift (polynomial)
					urlInfoSet.polyLocationShiftURL = caches.CN.urlInfoSet[0].polyLocationShiftURL;
					break;
				case "Apple":
					// Location Shift (polynomial)
					urlInfoSet.polyLocationShiftURL = caches.XX.urlInfoSet[0].polyLocationShiftURL;
					break;
			}
			return urlInfoSet;
		});
		Console.log("✅ Set UrlInfoSets");
		return urlInfoSets;
	}

	static muninBuckets(muninBuckets = [], caches = {}, settings = {}) {
		Console.log("☑️ Set MuninBuckets");
		switch (settings.TileSet.Munin) {
			case "CN":
				muninBuckets = caches.CN.muninBucket;
				break;
			case "HYBRID":
			case "XX":
			default:
				muninBuckets = caches.XX.muninBucket;
				break;
		}
		Console.log("✅ Set MuninBuckets");
		return muninBuckets;
	}

	static displayStrings(displayStrings = [], caches = {}, countryCode = "CN") {
		Console.log("☑️ Set DisplayStrings");
		switch (countryCode) {
			case "CN":
				displayStrings = caches.XX.displayString?.map((displayString, index) => {
					return displayString;
				});
				break;
			case "KR":
				//displayStrings = caches.KR.displayString;
				break;
			default:
				//displayStrings = caches.XX.displayString;
				break;
		}
		Console.log("✅ Set DisplayStrings");
		return displayStrings;
	}

	static tileGroups(tileGroups = [], tileSets = [], attributions = [], resources = []) {
		Console.log("☑️ Set TileGroups");
		tileGroups = tileGroups.map(tileGroup => {
			Console.debug(`tileGroup.identifier: ${tileGroup.identifier}`);
			tileGroup.identifier += Math.floor(Math.random() * 100) + 1;
			Console.debug(`tileGroup.identifier: ${tileGroup.identifier}`);
			tileGroup.tileSet = tileSets.map((tileSet, index) => {
				return {
					tileSetIndex: index,
					identifier: tileSet.validVersion?.[0]?.identifier,
				};
			});
			if (attributions)
				tileGroup.attributionIndex = attributions.map((attribution, index) => {
					return index;
				});
			if (resources)
				tileGroup.resourceIndex = resources.map((resource, index) => {
					return index;
				});
			return tileGroup;
		});
		Console.log("✅ Set TileGroups");
		return tileGroups;
	}
}
