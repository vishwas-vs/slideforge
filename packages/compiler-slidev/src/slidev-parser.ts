/**
 * Thin facade over @slidev/parser -- the rest of this package should
 * import from here, not reach into @slidev/parser/@slidev/types
 * directly, so there's one place to update if the upstream API shifts.
 */
export { parse, stringify } from '@slidev/parser';
export type { SlidevMarkdown, SourceSlideInfo } from '@slidev/types';
