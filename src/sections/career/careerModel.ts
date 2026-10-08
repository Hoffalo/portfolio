import type { Experience } from "../../content/types";

/** One organisation's roles, oldest first: a single job, or a run of promotions. */
export interface CareerTrack {
  organization: string;
  roles: Experience[];
}

/**
 * Groups roles at the same organisation into one track (a promotion keeps its desk) and orders the
 * tracks chronologically by when each one began, oldest first, so the career room reads as a story
 * that ends with the newest desk nearest the door.
 */
export function careerTracks(experiences: readonly Experience[]): CareerTrack[] {
  const byOrganization = new Map<string, Experience[]>();
  for (const experience of experiences) {
    const roles = byOrganization.get(experience.organization) ?? [];
    roles.push(experience);
    byOrganization.set(experience.organization, roles);
  }
  return [...byOrganization.entries()]
    .map(([organization, roles]) => ({
      organization,
      roles: [...roles].sort((a, b) => a.start.localeCompare(b.start)),
    }))
    .sort((a, b) => a.roles[0]!.start.localeCompare(b.roles[0]!.start));
}
