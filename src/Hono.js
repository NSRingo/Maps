import { Hono } from "hono";
import { fetch } from "@nsnanocat/util";
import { Response } from "./process/Response.js";
import { Request } from "./process/Request.js";
/***************** Processing *****************/
export default new Hono().all("/:rest{.*}", async c => {
    const url = new URL(c.req.url);
    const [host, ...path] = c.req.param("rest").split("/");
    url.protocol = "https:";
    url.hostname = host;
    url.port = "443";
    url.pathname = path.join("/");
    let $request = {
        url: url.toString(),
        method: c.req.method,
        headers: c.req.header(),
        body: ["GET", "HEAD"].includes(c.req.method) ? undefined : new Uint8Array(await c.req.arrayBuffer()),
    };
    let $response;
    ({ $request, $response } = await Request($request));
    if ($response) {
        Object.keys($response.headers).map(k => c.header(k, $response.headers[k]));
        return c.body($response.body);
    }
    $response = await fetch($request)
    delete $response.headers["content-length"];

    /* todo */
    // globalThis.$arguments = url.searchParams.get("Weather_Provider");

    $response = await Response($request, $response);
    Object.keys($response.headers).map(k => c.header(k, $response.headers[k]));
    return c.body($response.body);
});
