import getStorage from "@nsnanocat/util/getStorage.mjs";
import { Console } from "@nsnanocat/util";

/**
 * Set Environment Variables
 * @author VirgilClyne
 * @param {String} name - Persistent Store Key
 * @param {Array} platforms - Platform Names
 * @param {Object} database - Default DataBase
 * @return {Promise<Object>} { Settings, Caches, Configs }
 */
export default async function setENV(name, platforms, database, KV) {
	Console.log("☑️ Set Environment Variables");
	const { Settings, Caches, Configs } = getStorage(name, platforms, database);
	if (KV) {
		const persistedCaches = await KV.getItem("@iRingo.Maps.Caches", {});
		for (const key in Caches) delete Caches[key];
		if (typeof persistedCaches === "object" && persistedCaches !== null) Object.assign(Caches, persistedCaches);
	} else {
		delete Caches.GeoManifest;
		delete Caches.CN;
		delete Caches.XX;
		delete Caches.KR;
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
