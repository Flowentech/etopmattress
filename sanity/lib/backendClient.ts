import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

if (!process.env.SANITY_API_TOKEN) {
  throw new Error("SANITY_API_TOKEN is required for backend operations");
}

export const backendClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Set to false for write operations
  token: process.env.SANITY_API_TOKEN,
});
