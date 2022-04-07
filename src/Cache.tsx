class Cache {
	private data : Record<string, any>;
	private ttl : Record<string, number>;
	private json : Record<string, string>;
	
	public static TTL_6_HOURS = 21600;
	public static TTL_2_WEEKS = 1209600;
	public static TTL_3_MONTHS = 7890000;
	public static TTL_FOREVER = Number.MAX_SAFE_INTEGER;
	
	constructor() {
		try {
			this.data = JSON.parse(window.localStorage.getItem('cache') || '{}');
			this.ttl = JSON.parse(window.localStorage.getItem('cache_ttl') || '{}');

			this.json = {};
		} catch (ex) {
			console.error('Error occurred while retrieving cache from local storage. Clearing cache...', ex);
			
			localStorage.removeItem('cache');
			localStorage.removeItem('cache_ttl');
		}
	}
	
	hasExpired(key: string, purgeIfExpired: boolean = false) : boolean {
		if (this.ttl[key] && this.ttl[key] > Date.now()) {
			return false;
		} else if (this.ttl[key] === undefined && this.data[key] === undefined) {
			// Key doesn't exist.
			return false;
		} else if (this.ttl[key] === undefined || this.data[key] === undefined) {
			console.warn(`Cache key "${key}" has either value or TTL instead of both. Deleting key from both.`);
			this.remove(key);
			return false;
		}

		if (purgeIfExpired) {
			console.debug(`Cache key ${key} has expired. Removing...`);
			this.remove(key)
				.then(() => console.log(`Cache key deleted: ${key}`))
				.catch(console.error);
		}

		return true;
	}
	
	get<T>(key : string, fallback : T = null) : T {
		const value = this.data[key];
		
		if (this.hasExpired(key, true) || value == null) {
			return fallback;
		}
		
		return value;
	}
	
	private getJson(key : string) : string | false {
		if (! this.json[key]) {
			if (this.data[key] == null) {
				return false;
			}
			
			this.json[key] = JSON.stringify(this.data[key]);
		}
		
		return this.json[key];
	}

	keys() : string[] {
		return Object.keys(this.data);
	}
	
	set<T>(key : string, value : T, ttl : number = Cache.TTL_3_MONTHS) : Promise<T> {
		return new Promise((resolve, reject) => {
			try {
				this.data[key] = value;
				this.ttl[key] = Date.now() + ttl * 1000;
				delete this.json[key];
				
				this.commit();
				
				return resolve(value);
			} catch (ex) {
				console.error(ex.name, ex);
				return reject(ex);
			}
		});
	}
	
	setIfModified<T>(key : string, value : T, ttl : number = Cache.TTL_3_MONTHS) : Promise<T | false> {
		return new Promise((resolve, reject) => {
			try {
				if (this.getJson(key) === JSON.stringify(value)) {
					return resolve(false);
				}
				
				return resolve(this.set(key, value, ttl));
			} catch (ex) {
				console.error(ex.name, ex);
				return reject(ex);
			}
		});
	}
	
	remove(key : string, commit: boolean = true) : Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				delete this.data[key];
				delete this.ttl[key];
				delete this.json[key];

				if (commit) {
					this.commit();
				}

				return resolve();
			} catch (ex) {
				return reject(ex);
			}
		});
	}
	
	prune() : Promise<boolean> {
		return new Promise((resolve, reject) => {
			try {
				const expiredCacheKeys = Object.keys(this.data).filter(key => this.hasExpired(key, false));
				if (expiredCacheKeys.length === 0) {
					return resolve(false);
				}

				console.log(`Found ${expiredCacheKeys.length} expired cache entries. Removing...`);
				return Promise.all(expiredCacheKeys.map(key => this.remove(key, false)))
					.then(() => this.commit())
					.then(() => resolve(true));
			} catch (ex) {
				return reject(ex);
			}
		});
	}
	
	private commit() : void {
		window.localStorage.setItem('cache', JSON.stringify(this.data));
		window.localStorage.setItem('cache_ttl', JSON.stringify(this.ttl));
	}
}

export { Cache };

export default new Cache();