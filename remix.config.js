/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ["**/.*"],
  serverDependenciesToBundle: ["@supabase/supabase-js", "@supabase/ssr"],
  serverModuleFormat: "esm",
  future: {
    v2_errorBoundary: true,
    v2_headers: true,
    v2_meta: true,
    v2_normalizeFormMethod: true,
    v2_routeConvention: true,
  },
};