import { makeRouteHandler } from "@keystatic/next/route-handler";
import config from "../../../../../keystatic.config";

export const { GET, POST } = makeRouteHandler({
  config,
});

export const maxDuration = 300; // 5 minutes for large file uploads
