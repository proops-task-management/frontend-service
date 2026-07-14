// Tailwind v4: the PostCSS plugin moved to its own package (@tailwindcss/postcss),
// which now handles @import inlining and vendor-prefixing internally — so the v3
// `tailwindcss` + `autoprefixer` plugin pair is replaced by this single entry.
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
