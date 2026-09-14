/** All shipped media and outbound destinations live here. See docs/ASSET-MANIFEST.md. */
export const assets = {
  wordmark: '/assets/wordmark.png',
  cakePhoto: '/assets/chocolate-fudge.jpg',
  cakeDetail: '/assets/chocolate-detail.jpg',
  dani: '/assets/dani.jpg',
  cocoaTexture: '/assets/cocoa-crumb.jpg',
}
export const links = {
  product: 'https://prodanimiami.com/products/moist-chocolate-fudge-cake-copy',
  shop: 'https://prodanimiami.com/collections/all',
  baker: 'https://prodanimiami.com/pages/meet-your-baker',
}

type Defined<T> = { [K in keyof T]?: T[K] | undefined }
const pick = <T extends object>(values: Defined<T>) => Object.fromEntries(Object.entries(values).filter(([, v]) => v)) as Partial<T>

/** The Shopify section passes CDN asset URLs and store links at mount time. */
export function configure(media: Defined<typeof assets>, destinations: Defined<typeof links>) {
  Object.assign(assets, pick(media))
  Object.assign(links, pick(destinations))
}
