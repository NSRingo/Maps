import { Console } from "@nsnanocat/util";
//import { MESSAGE_TYPE, reflectionMergePartial, BinaryReader, WireType, UnknownFieldHandler, isJsonObject, typeofJsonValue, jsonWriteOptions, MessageType } from "@protobuf-ts/runtime";
import { Resources, ResourceType, ResourceFilterScale, ResourceFilterScenario, ResourceDownloadConnectionType, Resource_ValidationMethod, Resource_UpdateMethod } from "../proto/apple/geo/GEOResourceManifestDownload.js";
import { TileScale, TileSize, GenericTileType, TileSet_TileSetVersionUpdateBehavior, TileSet_TileSetChecksumType, TileSet_TileRequestStyle } from "../proto/apple/geo/protobuf/geo.js";
import { TileSetStyle } from "../proto/apple/geo/protobuf/geo/TileSetStyle.js";

export default class GEOResourceManifestDownload {
	static decode(rawBody = new Uint8Array([])) {
		Console.log("☑️ GEOResourceManifestDownload.decode");
		const body = Resources.fromBinary(rawBody);
		//Console.debug(`body.tileSet: ${JSON.stringify(body.tileSet)}`);
		if (typeof body.tileSet !== "undefined")
			body.tileSet = body.tileSet.map(tile => {
				if (typeof tile.style !== "undefined") tile.style = TileSetStyle[tile.style];
				if (typeof tile.validVersion !== "undefined")
					tile.validVersion = tile.validVersion.map(version => {
						if (typeof version.genericTile !== "undefined")
							version.genericTile = version.genericTile.map(genericTile => {
								if (typeof genericTile.tileType !== "undefined") genericTile.tileType = GenericTileType[genericTile.tileType];
								return genericTile;
							});
						return version;
					});
				if (typeof tile.scale !== "undefined") tile.scale = TileScale[tile.scale];
				if (typeof tile.size !== "undefined") tile.size = TileSize[tile.size];
				if (typeof tile.updateBehavior !== "undefined") tile.updateBehavior = TileSet_TileSetVersionUpdateBehavior[tile.updateBehavior];
				if (typeof tile.checksumType !== "undefined") tile.checksumType = TileSet_TileSetChecksumType[tile.checksumType];
				if (typeof tile.requestStyle !== "undefined") tile.requestStyle = TileSet_TileRequestStyle[tile.requestStyle];
				return tile;
			});
		if (typeof body.attribution !== "undefined")
			body.attribution = body.attribution.map(attribution => {
				if (typeof attribution.resource !== "undefined")
					attribution.resource = attribution.resource.map(resource => {
						if (typeof resource.resourceType !== "undefined") resource.resourceType = ResourceType[resource.resourceType];
						if (typeof resource.filter !== "undefined")
							resource.filter = resource.filter.map(filter => {
								if (typeof filter.scale !== "undefined") filter.scale = filter.scale.map(scale => ResourceFilterScale[scale]);
								if (typeof filter.scenario !== "undefined") filter.scenario = filter.scenario.map(scenario => ResourceFilterScenario[scenario]);
								return filter;
							});
						if (typeof resource.connectionType !== "undefined") resource.connectionType = ResourceDownloadConnectionType[resource.connectionType];
						if (typeof resource.validationMethod !== "undefined") resource.validationMethod = Resource_ValidationMethod[resource.validationMethod];
						if (typeof resource.updateMethod !== "undefined") resource.updateMethod = Resource_UpdateMethod[resource.updateMethod];
						return resource;
					});
				return attribution;
			});
		if (typeof body.resource !== "undefined")
			body.resource = body.resource.map(resource => {
				if (typeof resource.resourceType !== "undefined") resource.resourceType = ResourceType[resource.resourceType];
				if (typeof resource.filter !== "undefined")
					resource.filter = resource.filter.map(filter => {
						if (typeof filter.scale !== "undefined") filter.scale = filter.scale.map(scale => ResourceFilterScale[scale]);
						if (typeof filter.scenario !== "undefined") filter.scenario = filter.scenario.map(scenario => ResourceFilterScenario[scenario]);
						return filter;
					});
				if (typeof resource.connectionType !== "undefined") resource.connectionType = ResourceDownloadConnectionType[resource.connectionType];
				if (typeof resource.validationMethod !== "undefined") resource.validationMethod = Resource_ValidationMethod[resource.validationMethod];
				if (typeof resource.updateMethod !== "undefined") resource.updateMethod = Resource_UpdateMethod[resource.updateMethod];
				return resource;
			});
		Console.log("✅ GEOResourceManifestDownload.decode");
		return body;
	}

	static encode(body = {}) {
		Console.log("☑️ GEOResourceManifestDownload.encode");
		if (typeof body.tileSet !== "undefined")
			body.tileSet = body.tileSet.map(tile => {
				if (typeof tile.style !== "undefined") tile.style = TileSetStyle[tile.style];
				if (typeof tile.validVersion !== "undefined")
					tile.validVersion = tile.validVersion.map(version => {
						if (typeof version.genericTile !== "undefined")
							version.genericTile = version.genericTile.map(genericTile => {
								if (typeof genericTile.tileType !== "undefined") genericTile.tileType = GenericTileType[genericTile.tileType];
								return genericTile;
							});
						return version;
					});
				if (typeof tile.scale !== "undefined") tile.scale = TileScale[tile.scale];
				if (typeof tile.size !== "undefined") tile.size = TileSize[tile.size];
				if (typeof tile.updateBehavior !== "undefined") tile.updateBehavior = TileSet_TileSetVersionUpdateBehavior[tile.updateBehavior];
				if (typeof tile.checksumType !== "undefined") tile.checksumType = TileSet_TileSetChecksumType[tile.checksumType];
				if (typeof tile.requestStyle !== "undefined") tile.requestStyle = TileSet_TileRequestStyle[tile.requestStyle];
				return tile;
			});
		if (typeof body.attribution !== "undefined")
			body.attribution = body.attribution.map(attribution => {
				if (typeof attribution.resource !== "undefined")
					attribution.resource = attribution.resource.map(resource => {
						if (typeof resource.resourceType !== "undefined") resource.resourceType = ResourceType[resource.resourceType];
						if (typeof resource.filter !== "undefined")
							resource.filter = resource.filter.map(filter => {
								if (typeof filter.scale !== "undefined") filter.scale = filter.scale.map(scale => ResourceFilterScale[scale]);
								if (typeof filter.scenario !== "undefined") filter.scenario = filter.scenario.map(scenario => ResourceFilterScenario[scenario]);
								return filter;
							});
						if (typeof resource.connectionType !== "undefined") resource.connectionType = ResourceDownloadConnectionType[resource.connectionType];
						if (typeof resource.validationMethod !== "undefined") resource.validationMethod = Resource_ValidationMethod[resource.validationMethod];
						if (typeof resource.updateMethod !== "undefined") resource.updateMethod = Resource_UpdateMethod[resource.updateMethod];
						return resource;
					});
				return attribution;
			});
		if (typeof body.resource !== "undefined")
			body.resource = body.resource.map(resource => {
				if (typeof resource.resourceType !== "undefined") resource.resourceType = ResourceType[resource.resourceType];
				if (typeof resource.filter !== "undefined")
					resource.filter = resource.filter.map(filter => {
						if (typeof filter.scale !== "undefined") filter.scale = filter.scale.map(scale => ResourceFilterScale[scale]);
						if (typeof filter.scenario !== "undefined") filter.scenario = filter.scenario.map(scenario => ResourceFilterScenario[scenario]);
						return filter;
					});
				if (typeof resource.connectionType !== "undefined") resource.connectionType = ResourceDownloadConnectionType[resource.connectionType];
				if (typeof resource.validationMethod !== "undefined") resource.validationMethod = Resource_ValidationMethod[resource.validationMethod];
				if (typeof resource.updateMethod !== "undefined") resource.updateMethod = Resource_UpdateMethod[resource.updateMethod];
				return resource;
			});
		//Console.debug(`body.tileSet: ${JSON.stringify(body.tileSet)}`);
		const rawBody = Resources.toBinary(body);
		Console.log("✅ GEOResourceManifestDownload.encode");
		return rawBody;
	}
}
