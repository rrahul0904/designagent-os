const COLOR_PATTERN = /#(?:[0-9a-fA-F]{3,8})\b|rgba?\([^)]*\)|hsla?\([^)]*\)/g;
const CSS_VAR_PATTERN = /--([\w-]+)\s*:\s*([^;}{]+)/g;
const FONT_PATTERN = /font-family\s*:\s*([^;}{]+)/gi;
const RADIUS_PATTERN = /border-radius\s*:\s*([^;}{]+)/gi;
const SPACING_PATTERN = /(?:margin|padding|gap)(?:-[\w]+)?\s*:\s*([^;}{]+)/gi;

function unique(values) {
  return [...new Set(values.map(v => v.trim()).filter(Boolean))];
}

function collect(pattern, source, group = 0) {
  const output = [];
  for (const match of source.matchAll(pattern)) output.push(match[group]);
  return unique(output);
}

export function extractDesignDNA(source = "") {
  const variables = {};
  for (const match of source.matchAll(CSS_VAR_PATTERN)) {
    variables[match[1]] = match[2].trim();
  }

  return {
    cssVariables: variables,
    colors: collect(COLOR_PATTERN, source),
    fontFamilies: collect(FONT_PATTERN, source, 1),
    radii: collect(RADIUS_PATTERN, source, 1),
    spacingValues: collect(SPACING_PATTERN, source, 1),
    signals: {
      usesTailwind: /(?:className|class)=["'][^"']*(?:flex|grid|p-|m-|rounded-|bg-|text-)/.test(source),
      usesCssVariables: Object.keys(variables).length > 0,
      hasFocusVisible: /focus-visible/.test(source),
      hasReducedMotion: /prefers-reduced-motion/.test(source),
      hasDarkModeSignal: /dark:|prefers-color-scheme\s*:\s*dark|data-theme=["']dark/.test(source)
    }
  };
}
