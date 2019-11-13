class Preferences {
    static THEME = 'theme';

    constructor() {
        try {
            this.data = JSON.parse(window.localStorage.getItem('preferences') || '{}');
        } catch (ex) {
            console.error('Error occurred while retrieving preferences from local storage. Clearing preferences...', ex);

            localStorage.removeItem('preferences');
        }
    }

    get(key, fallback = null) {
        const value = this.data[key];

        if (value === null) {
            return fallback;
        }

        return value;
    }

    set = (key, value) => new Promise((resolve, reject) => {
        try {
            this.data[key] = value;

            this.commit();

            return resolve(value);
        } catch (ex) {
            return reject(ex);
        }
    });

    remove = key => new Promise((resolve, reject) => {
        try {
            delete this.data[key];

            this.commit();

            return resolve();
        } catch (ex) {
            return reject(ex);
        }
    });

    commit() {
        window.localStorage.setItem('preferences', JSON.stringify(this.data));
    }
}

export default Preferences;
