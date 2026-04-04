import { KV as Storage } from "@auraflare/shared";
import getStorage from "@nsnanocat/util/getStorage.mjs";
import { Console } from "@nsnanocat/util";

/**
 * Set Environment Variables
 * @author VirgilClyne
 * @param {String} name - Persistent Store Key
 * @param {Array} platforms - Platform Names
 * @param {Object} database - Default DataBase
 * @param {Object} env - Worker Environment Bindings
 * @return {Promise<Object>} { Settings, Caches, Configs }
 */
export default async function setENV(name, platforms, database, env) {
	Console.log("☑️ Set Environment Variables");
	const { Settings, Caches, Configs } = getStorage(name, platforms, database);
	delete Caches.GeoManifest;
	delete Caches.CN;
	delete Caches.XX;
	delete Caches.KR;
	if (env?.PersistentStore) {
		const storage = new Storage({ env: { namespace: env.PersistentStore } });
		const geoManifest = await storage.getItem("@iRingo.Maps.Caches.GeoManifest", {});
		for (const key in Caches) if (key.startsWith("?")) delete Caches[key];
		if (typeof geoManifest === "object" && geoManifest !== null) for (const key in geoManifest) if (key.startsWith("?")) Caches[key] = geoManifest[key];
	}
	/***************** Settings *****************/
	Console.info(`typeof Settings: ${typeof Settings}`, `Settings: ${JSON.stringify(Settings, null, 2)}`);
	/***************** Caches *****************/
	//Console.debug(`typeof Caches: ${typeof Caches}`, `Caches: ${JSON.stringify(Caches)}`);
	/***************** Configs *****************/
	//Configs.Storefront = new Map(Configs.Storefront);
	if (Configs.Locale) Configs.Locale = new Map(Configs.Locale);
	if (Configs.i18n) for (const type in Configs.i18n) Configs.i18n[type] = new Map(Configs.i18n[type]);
	Console.log("✅ Set Environment Variables");
	return { Settings, Caches, Configs };
}
