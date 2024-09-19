export const localStorageMock = (function() {
  let store = {};
  return {
    getItem: function(key) {
      return store[key] || null; // Si la clé n'existe pas, retourne null
    },
    setItem: function(key, value) {
      store[key] = value; // Stocker la valeur telle qu'elle est
    },
    clear: function() {
      store = {};
    },
    removeItem: function(key) {
      delete store[key];
    }
  };
})();

