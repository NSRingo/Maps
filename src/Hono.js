import { Hono } from "hono";
import { fetch } from "@nsnanocat/util";
import { Response } from "./process/Response.js";
import { Request } from "./process/Request.js";
/***************** Processing *****************/
export default new Hono().all("/:rest{.*}", async c => {
	const url = new URL(c.req.url);
	switch (true) {
		case url.hostname.startsWith("configuration.ls."):
			url.hostname = "configuration.ls.apple.com";
			break;
		case url.hostname.startsWith("gspe35-ssl.ls."):
			url.hostname = "gspe35-ssl.ls.apple.com";
			break;
		default:
		case url.hostname.endsWith(".workers.dev"): {
			const [host, ...path] = c.req.param("rest").split("/");
			url.protocol = "https:";
			url.hostname = host;
			url.port = "443";
			url.pathname = path.join("/");
			break;
		}
	}
	let $request = {
		method: c.req.method,
		url: url.toString(),
		headers: c.req.header(),
		bodyBytes: await c.req.arrayBuffer().catch(error => {
			console.info(error);
			return undefined;
		}),
	};
	let $response;
	({ $request, $response } = await Request($request));
	if ($response) {
		Object.keys($response.headers).map(k => c.header(k, $response.headers[k]));
		return c.body($response.body);
	}
	$response = await fetch($request);
	delete $response.headers["content-length"];

	/* todo */
	// globalThis.$arguments = url.searchParams.get("Weather_Provider");

	$response = await Response($request, $response);
	Object.keys($response.headers).map(k => c.header(k, $response.headers[k]));
	return c.body($response.body);
});
