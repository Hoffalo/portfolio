import type { ShelfItem } from "./types";

/** One rule per kind of shelf item. A new kind fails to compile until every table handles it. */
export type RulesByKind<Result> = {
  [Kind in ShelfItem["kind"]]: (item: Extract<ShelfItem, { kind: Kind }>) => Result;
};

export function applyRuleFor<Result>(rules: RulesByKind<Result>, item: ShelfItem): Result {
  // TypeScript can't correlate `item.kind` with the rule it selects, though the mapped type guarantees it.
  return (rules[item.kind] as (item: ShelfItem) => Result)(item);
}
