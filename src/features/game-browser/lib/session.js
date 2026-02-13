export const ssGet = (k) => sessionStorage.getItem(k) || null;
export const ssSet = (k, v) => sessionStorage.setItem(k, v);
export const ssRemove = (k) => sessionStorage.removeItem(k);
