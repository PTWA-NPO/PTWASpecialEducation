function isUndefined(value) {
  let patten = /undefined/i;
  return patten.test(value);
}

export function getAssets(url) {
  return new URL(`../assets/` + url, import.meta.url).href;
}

export function getGameAssets(id, url) {
  return new URL(`../assets/games/${id}/${url}`, import.meta.url).href;
}

export function getSystemEffectAssets(url) {
  return new URL(`../assets/system/effects/${url}`, import.meta.url).href;
}

export function getSystemAssets(url, service) {
  return new URL(`../assets/system/${service}/${url}`, import.meta.url).href;
}

export function getTheamsAssets(TheamName) {
  return new URL(`../theams/${TheamName}`, import.meta.url).href;
}

export function getSlotComponentAssets(name, url) {
  return new URL(`../assets/slot-component-data/${name}/${url}`, import.meta.url)
    .href;
}

export function getGameStaticAssets(gameName, url) {
  return new URL(`../assets/game-static/${gameName}/${url}`, import.meta.url).href;
}

export function getDefaultHintAssets(url) {
  let path = new URL(`../assets/system/hint-library/${url}`, import.meta.url)
    .href;
  return path;
}

export function getSoundAssets(serviceName, url) {
  return new URL(`../assets/sounds/${serviceName}/${url}`, import.meta.url).href;
}

// The following function are about to remove, please use the above functions instead.

