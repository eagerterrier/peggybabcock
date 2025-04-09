const URLs = ['mixed-biscuits', 'bag-o-biscuits', 'biscuit-crumbs', 'biscuit-scrapings', 'biscuit-dust', 'legal-department', 'lawsuits', 'stockists', 'our-history'];
const images = ['img/Peggy-Babcock-Logo.png', 'img/peggy-babcock.jpg', 'img/alligator-park.jpg'];
const icons = ['icons/favicon.ico'];
const dataURLs = URLs.map(url => `data${url}.json`);

const CACHE_VERSION = "v2";

const currentURL = self.location.pathname;
const baseURL = self.location.hostname === 'localhost' ? '/peggybabcock/' : '/';

const ALL_RESOURCES = [...URLs, ...dataURLs, ...icons, ...images].map(url => baseURL + url);

const addResourcesToCache = async (resources) => {
  const cache = await caches.open(CACHE_VERSION);
  await cache.addAll(resources);
};

self.addEventListener("install", (event) => {
//   event.waitUntil(
//     addResourcesToCache(ALL_RESOURCES)
//   );
});