/**
 * Every value of @slidev/types' `BuiltinLayouts` union, transcribed by
 * hand -- that type exists in @slidev/types' source
 * (src/builtin-layouts.d.ts) but isn't part of its public exports, so we
 * can't import and `satisfies`-check against it directly. Re-verify
 * this list against the installed @slidev/types version's
 * dist/index.d.mts if Slidev adds/renames a built-in layout.
 */
const BUILTIN_LAYOUT_LIST = [
  '404',
  'center',
  'cover',
  'default',
  'end',
  'error',
  'fact',
  'full',
  'iframe-left',
  'iframe-right',
  'iframe',
  'image-left',
  'image-right',
  'image',
  'intro',
  'none',
  'quote',
  'section',
  'statement',
  'two-cols-header',
  'two-cols',
] as const;

const BUILTIN_LAYOUTS: ReadonlySet<string> = new Set(BUILTIN_LAYOUT_LIST);

/**
 * Resolves a Beat's `visualHint` to a Slidev built-in layout name when it
 * matches one -- otherwise returns undefined, leaving Slidev's own
 * per-slide default (`cover` for the first real slide, `default`
 * otherwise) in place rather than overriding every slide with a
 * hard-coded value.
 *
 * `visualHint` means something different to each compiler (see
 * docs/content-model.md) -- here it's read as a layout hint, and
 * anything that isn't a real Slidev layout name (e.g. a HyperFrames
 * catalog block id like `code-3d-extrude`) is a legitimate non-match,
 * not an error.
 */
export function resolveSlidevLayout(visualHint: string | undefined): string | undefined {
  if (!visualHint) {
    return undefined;
  }
  const normalized = visualHint.trim().toLowerCase();
  return BUILTIN_LAYOUTS.has(normalized) ? normalized : undefined;
}
