import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

interface ExtensionManifest {
  commands: {
    _execute_action: {
      suggested_key: {
        default: string;
        mac: string;
      };
    };
  };
  browser_specific_settings: {
    gecko: {
      data_collection_permissions: {
        required: string[];
      };
    };
  };
}

function readManifest(): ExtensionManifest {
  const manifestPath = resolve(import.meta.dirname, "../public/manifest.json");
  return JSON.parse(readFileSync(manifestPath, "utf8")) as ExtensionManifest;
}

describe("extension commands", () => {
  it("uses the Command key for the macOS palette shortcut", () => {
    const manifest = readManifest();

    expect(manifest.commands._execute_action.suggested_key.mac).toBe(
      "Command+Shift+K",
    );
  });
});

describe("extension data collection declaration", () => {
  it("declares that no data is collected outside the browser", () => {
    const manifest = readManifest();

    expect(
      manifest.browser_specific_settings.gecko.data_collection_permissions.required,
    ).toEqual(["none"]);
  });
});
