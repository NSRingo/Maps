export default class HonoWorkerAdapter {
	static rewriteUrl(url, rest = "") {
		switch (true) {
			case url.hostname.startsWith("configuration-ls."):
			case url.hostname.startsWith("configuration.ls."):
				url.hostname = "configuration.ls.apple.com";
				break;
			case url.hostname.startsWith("gspe35-ssl-ls."):
			case url.hostname.startsWith("gspe35-ssl.ls."):
				url.hostname = "gspe35-ssl.ls.apple.com";
				break;
			default:
			case url.hostname.endsWith(".workers.dev"): {
				const [host, ...path] = `${rest}`.split("/");
				if (!host) break;
				url.protocol = "https:";
				url.hostname = host;
				url.port = "443";
				url.pathname = `/${path.join("/")}`;
				break;
			}
		}
		return url;
	}

	static normalizeRequestHeaders(headers = {}) {
		const requestHeaderBlacklist = new Set(["connection", "content-length", "host", "x-forwarded-proto", "x-real-ip"]);
		return Object.entries(headers).reduce((normalizedHeaders, [key, value]) => {
			if (value === undefined) return normalizedHeaders;
			const normalizedKey = key.toLowerCase();
			if (normalizedKey.startsWith("cf-") || requestHeaderBlacklist.has(normalizedKey)) return normalizedHeaders;
			normalizedHeaders[key] = value;
			return normalizedHeaders;
		}, {});
	}

	static async buildRequest(c) {
		const url = HonoWorkerAdapter.rewriteUrl(new URL(c.req.url), c.req.param("rest"));
		const method = c.req.method;
		let bodyBytes;
		switch (method) {
			case "GET":
			case "HEAD":
			case "OPTIONS":
				break;
			default:
				bodyBytes = await c.req.arrayBuffer().catch(error => {
					console.info(error);
					return undefined;
				});
				if (!bodyBytes?.byteLength) bodyBytes = undefined;
				break;
		}
		return {
			method,
			url: url.toString(),
			headers: HonoWorkerAdapter.normalizeRequestHeaders(c.req.header()),
			body: bodyBytes,
			bodyBytes,
		};
	}

	static cleanupResponseHeaders(headers = {}) {
		const normalizedHeaders = { ...headers };
		if (normalizedHeaders["Content-Encoding"]) normalizedHeaders["Content-Encoding"] = "identity";
		if (normalizedHeaders["content-encoding"]) normalizedHeaders["content-encoding"] = "identity";
		delete normalizedHeaders["Content-Length"];
		delete normalizedHeaders["content-length"];
		delete normalizedHeaders["Transfer-Encoding"];
		delete normalizedHeaders["transfer-encoding"];
		return normalizedHeaders;
	}

	static writeResponse(c, $response = {}) {
		const headers = HonoWorkerAdapter.cleanupResponseHeaders($response.headers ?? {});
		for (const [key, value] of Object.entries(headers)) {
			if (Array.isArray(value)) {
				for (const entry of value) c.header(key, entry.toString(), { append: true });
				continue;
			}
			if (value !== undefined) c.header(key, value.toString());
		}
		c.status($response.status ?? $response.statusCode ?? 200);
		return c.body($response.body ?? $response.bodyBytes ?? null);
	}
}
