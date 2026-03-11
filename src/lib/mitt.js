import mitt from "mitt";

const originalMitt = mitt();

export const subComponentsVerifyAnswer = {
  all: originalMitt.all,
  on(type, handler) {
    if (typeof handler !== 'function') {
      console.warn(`[mitt.js] Attempted to register a non-function handler for event '${type}':`, handler);
      // Optional: you can choose not to return early to fail gracefully, but we'll prevent adding it
      return; 
    }
    originalMitt.on(type, handler);
  },
  off(type, handler) {
    originalMitt.off(type, handler);
  },
  emit(type, evt) {
    // Before emitting, let's clean up or filter any accidentally added non-functions
    const handlers = originalMitt.all.get(type);
    if (handlers) {
      // It's possible handlers array has undefineds if spliced poorly elsewhere?
      // Actually mitt.js manages the array, but let's be safe.
      originalMitt.all.set(type, handlers.filter(h => typeof h === 'function'));
    }
    const wildcards = originalMitt.all.get('*');
    if (wildcards) {
      originalMitt.all.set('*', wildcards.filter(h => typeof h === 'function'));
    }
    
    originalMitt.emit(type, evt);
  }
};