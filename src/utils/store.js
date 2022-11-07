const store = {
  storage: window.localStorage,
  set(key, value) {
    if (!value) return;

    this.storage.setItem(key, serialize(value));
  },
  get(key) {
    if (!key) return;

    const val = this.storage.getItem(key);
    try {
      return JSON.parse(val);
    } catch (e) {
      return val;
    }
  },
  remove(key) {
    if (!key) return;

    this.storage.removeItem(key);
  },
  clear() {
    this.storage.clear();
  },
  // 批量删除 array => key 数组
  removeList(array) {
    for (const key of array) {
      this.storage.removeItem(key);
    }
  }
};

const serialize = function (value) {
  if (!value) return '';

  let val = '';
  const type = Object.prototype.toString.call(value);
  if (type === '[object Object]' || type === '[object Array]') {
    val = JSON.stringify(value);
  } else {
    val = value;
  }

  return val;
};

export default store;
