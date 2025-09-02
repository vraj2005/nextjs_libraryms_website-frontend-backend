import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "images.unsplash.com",
      "cdn-icons-png.flaticon.com",
      "png.pngtree.com",
      "th.bing.com",
      "www.pngall.com",
      "pngimg.com",
      "static.vecteezy.com",
      "file.aiquickdraw.com",
      "www.citypng.com",
      // add more allowed domains as needed
    ],
  },
};

export default nextConfig;
