import { Hono } from "hono";
//import { fetch } from "@nsnanocat/util";
import { Response } from "./process/Response.mjs";
import { Request } from "./process/Request.mjs";
/***************** Processing *****************/
export default new Hono().all("/:rest{.*}", async c => {
	const url = new URL(c.req.url);
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
	({ $request, $response } = await Request($request, c.env));
	switch (typeof $response) {
		case "object": // 有构造回复数据，返回构造的回复数据
            console.debug("finally", `echo $response: ${JSON.stringify($response, null, 2)}`);
			Object.keys($response.headers).map(k => c.header(k, $response.headers[k]));
			return c.body($response.body);
		case "undefined": // 无构造回复数据，发送修改的请求数据
            console.debug("finally", `$request: ${JSON.stringify($request, null, 2)}`);
			$response = await fetch($request);
			$response.headers = $response.headers()
			$response.bodyBytes = await $response.arrayBuffer().catch(error => {
				console.info(error);
				return undefined;
			});
			$response = await Response($request, $response, c.env);
			return c.body($response.body);
		default:
			console.error(`不合法的 $response 类型: ${typeof $response}`);
			break;
	}
});
