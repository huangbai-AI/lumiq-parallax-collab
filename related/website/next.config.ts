import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  distDir: process.env.LUMIQ_NEXT_DIST_DIR ?? ".next",
  images: {
    unoptimized: false,
  },
};

export default withNextIntl(nextConfig);
