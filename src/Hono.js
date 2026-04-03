import { fetch } from "@nsnanocat/util";
import { Hono } from "hono";
import HonoWorkerAdapter from "./class/HonoWorkerAdapter.mjs";
import { Response } from "./process/Response.mjs";
import { Request } from "./process/Request.mjs";
/***************** Processing *****************/

export default new Hono().all("/:rest{.*}", async c => {
	let $request = await HonoWorkerAdapter.buildRequest(c);
	let $response;
	({ $request, $response } = await Request($request, c.env));
	switch (typeof $response) {
		case "object": // 有构造回复数据，返回构造的回复数据
			console.debug("finally", `echo $response: ${JSON.stringify($response, null, 2)}`);
			return HonoWorkerAdapter.writeResponse(c, $response);
		case "undefined": // 无构造回复数据，发送修改的请求数据
			console.debug("finally", `$request: ${JSON.stringify($request, null, 2)}`);
			$response = await fetch($request);
			$response = await Response($request, $response, c.env);
			return HonoWorkerAdapter.writeResponse(c, $response);
		default:
			console.error(`不合法的 $response 类型: ${typeof $response}`);
			return c.body("", 500);
	}
});
