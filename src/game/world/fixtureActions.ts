import type { FixtureAction } from "./world";

/**
 * What a place does with each kind of action. Each view handles only the actions its fixtures
 * produce (the town has no carousel, a room has no buildings), so every handler is optional.
 */
export type FixtureActionHandlers = {
  [Type in FixtureAction["type"]]?: (action: Extract<FixtureAction, { type: Type }>) => void;
};

export function runFixtureAction(action: FixtureAction, handlers: FixtureActionHandlers) {
  // TypeScript can't correlate `action.type` with the handler it selects, though the mapped type guarantees it.
  const handle = handlers[action.type] as ((action: FixtureAction) => void) | undefined;
  handle?.(action);
}
