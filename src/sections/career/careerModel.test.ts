import { describe, expect, it } from "vitest";
import type { Experience } from "../../content/types";
import { careerTracks } from "./careerModel";

const role = (id: string, organization: string, start: Experience["start"]): Experience => ({
  id,
  organization,
  role: { en: id, pt: id },
  start,
  highlights: [],
  tags: [],
});

describe("careerTracks", () => {
  it("orders organisations by when they began and keeps promotions on one track", () => {
    const tracks = careerTracks([
      role("manager", "BRASA", "2026-08"),
      role("intern", "BTG", "2026-06"),
      role("analyst", "BRASA", "2025-06"),
      role("school", "Park", "2023-03"),
    ]);
    expect(tracks.map((track) => track.organization)).toEqual(["Park", "BRASA", "BTG"]);
    expect(tracks[1]!.roles.map((r) => r.id)).toEqual(["analyst", "manager"]);
  });
});
