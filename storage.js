// storage.js
(function (global) {
  const LS_KEY = 'demo_food_app_v1';

  // Low-level: read raw JSON from localStorage
  function readRaw() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.error('storage.js readRaw parse error', e);
      return null;
    }
  }

  // Ensure we always have a valid, normalised state object
  function ensureState() {
    let s = readRaw();

    // If nothing stored yet, create a fresh initial state
    if (!s) {
      s = {
        users: {
          customers: [],
          restaurants: [],
          riders: [],
          admins: [
            {
              id: '001',
              name: 'Admin',
              password: '001',
              role: 'admin'
            }
          ]
        },
        orders: [],
        reviews: [],
        currentUser: null,
        cart: {
          restaurantId: null,
          items: [] // { dishId, dishName, price, quantity, imageUrl }
        },
        meta: {
          createdAt: Date.now()
        }
      };

      try {
        localStorage.setItem(LS_KEY, JSON.stringify(s));
      } catch (e) {
        console.error('storage.js initial save failed', e);
      }
      return s;
    }

    // --- Normalise shape for older / corrupted data ---

    if (!s.users || typeof s.users !== 'object') {
      s.users = {};
    }

    if (!Array.isArray(s.users.customers)) s.users.customers = [];
    if (!Array.isArray(s.users.restaurants)) s.users.restaurants = [];
    if (!Array.isArray(s.users.riders)) s.users.riders = [];
    if (!Array.isArray(s.users.admins)) s.users.admins = [];

    // ✅ Always guarantee default admin exists (even on old data)
    const hasDefaultAdmin = s.users.admins.some(
      (a) => a && a.id === '001'
    );
    if (!hasDefaultAdmin) {
      s.users.admins.push({
        id: '001',
        name: 'Admin',
        password: '001',
        role: 'admin'
      });
    }

    if (!Array.isArray(s.orders)) s.orders = [];
    if (!Array.isArray(s.reviews)) s.reviews = [];

    if (!s.cart || typeof s.cart !== 'object') {
      s.cart = { restaurantId: null, items: [] };
    } else {
      if (!Array.isArray(s.cart.items)) s.cart.items = [];
      if (!('restaurantId' in s.cart)) s.cart.restaurantId = null;
    }

    if (typeof s.currentUser === 'undefined') {
      s.currentUser = null;
    }

    if (!s.meta || typeof s.meta !== 'object') {
      s.meta = { createdAt: Date.now() };
    }

    // Persist any fixes back to localStorage
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(s));
    } catch (e) {
      console.error('storage.js normalization failed', e);
    }

    return s;
  }

  // High-level state helpers
  function getState() {
    return ensureState();
  }

  function setState(newState) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(newState));
      return true;
    } catch (e) {
      console.error('storage.js setState error', e);
      return false;
    }
  }

  // ----- Users -----
  function getUsers() {
    const state = getState();
    return state.users;
  }

  function setUsers(users) {
    const state = getState();
    state.users = users || {
      customers: [],
      restaurants: [],
      riders: [],
      admins: []
    };
    // Re-run some safety checks (esp. default admin)
    if (!Array.isArray(state.users.admins)) state.users.admins = [];
    const hasDefaultAdmin = state.users.admins.some(
      (a) => a && a.id === '001'
    );
    if (!hasDefaultAdmin) {
      state.users.admins.push({
        id: '001',
        name: 'Admin',
        password: '001',
        role: 'admin'
      });
    }
    setState(state);
  }

  // ----- Orders -----
  function getOrders() {
    const state = getState();
    return state.orders;
  }

  function setOrders(orders) {
    const state = getState();
    state.orders = Array.isArray(orders) ? orders : [];
    setState(state);
  }

  // ----- Current user (logged-in user) -----
  function getCurrentUser() {
    const state = getState();
    return state.currentUser || null;
  }

  function setCurrentUser(user) {
    const state = getState();
    state.currentUser = user || null;
    setState(state);
  }

  // ----- Cart (customer) -----
  function getCart() {
    const state = getState();
    if (!state.cart || typeof state.cart !== 'object') {
      state.cart = { restaurantId: null, items: [] };
      setState(state);
    } else if (!Array.isArray(state.cart.items)) {
      state.cart.items = [];
      setState(state);
    }
    return state.cart;
  }

  function setCart(cart) {
    const state = getState();
    state.cart = cart || { restaurantId: null, items: [] };
    setState(state);
  }

  // Expose to global scope so HTML pages can call them
  global.getState = getState;
  global.setState = setState;

  global.getUsers = getUsers;
  global.setUsers = setUsers;

  global.getOrders = getOrders;
  global.setOrders = setOrders;

  global.getCurrentUser = getCurrentUser;
  global.setCurrentUser = setCurrentUser;

  global.getCart = getCart;
  global.setCart = setCart;
})(window);
