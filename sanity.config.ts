"use client";

import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { apiVersion, dataset, projectId } from "./sanity/env";
import { schema } from "./sanity/schemaTypes";
import { structure } from "./sanity/structure";
import { presentationTool } from "sanity/presentation";

export default defineConfig({
  basePath: "/studio",
  title: "Etopmattress Studio",
  projectId,
  dataset,
  apiVersion,
  schema,
  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
    presentationTool({
      previewUrl: {
        preview: "/",
        previewMode: {
          enable: "/draft-mode/enable",
        },
      },
    }),
  ],
});
