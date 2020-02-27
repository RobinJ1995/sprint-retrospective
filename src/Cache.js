class Cache {
    static TTL_2_WEEKS = 1209600;
    static TTL_3_MONTHS = 7890000;

    constructor() {
        try {
            this.data = JSON.parse(window.localStorage.getItem('cache') || '{}');
            this.ttl = JSON.parse(window.localStorage.getItem('cache_ttl') || '{}');

            this._json = {};
        } catch (ex) {
            console.error('Error occurred while retrieving cache from local storage. Clearing cache...', ex);

            localStorage.removeItem('cache');
            localStorage.removeItem('cache_ttl');
        }
    }

    hasExpired(key) {
        if (this.ttl[key] && this.ttl[key] > Date.now()) {
            return false;
        }

        this.remove(key);

        return true;
    }

    get(key, fallback = null) {
        const value = this.data[key];

        if (this.hasExpired(key) || value == null) {
            return fallback;
        }

        return value;
    }

    _getJson(key) {
        if (! this._json[key]) {
            if (this.data[key] == null) {
                return false;
            }

            this._json[key] = JSON.stringify(this.data[key]);
        }

        return this._json[key];
    }

    set = (key, value, ttl = Cache.TTL_3_MONTHS) => new Promise((resolve, reject) => {
        try {
            this.data[key] = value;
            this.ttl[key] = Date.now() + ttl * 1000;
            delete this._json[key];

            this.commit();

            return resolve(value);
        } catch (ex) {
            return reject(ex);
        }
    });

    setIfModified = (key, value, ttl = Cache.TTL_3_MONTHS) => new Promise((resolve, reject) => {
        try {
            if (this._getJson(key) === JSON.stringify(value)) {
                return resolve(false);
            }

            return resolve(this.set(key, value, ttl));
        } catch (ex) {
            return reject(ex);
        }
    });

    remove = key => new Promise((resolve, reject) => {
        try {
            delete this.data[key];
            delete this.ttl[key];
            delete this._json[key];

            this.commit();

            return resolve();
        } catch (ex) {
            return reject(ex);
        }
    });

    prune = () => new Promise((resolve, reject) => {
        try {
            if (Object.keys(this.data).map(this.hasExpired).some(expired => !!expired)) {
                this.commit();

                return resolve(true);
            }

            return resolve(false);
        } catch (ex) {
            return reject(ex);
        }
    });

    commit() {
        window.localStorage.setItem('cache', JSON.stringify(this.data));
        window.localStorage.setItem('cache_ttl', JSON.stringify(this.ttl));
    }
}

export default Cache;
