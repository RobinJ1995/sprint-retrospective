import cache, { Cache } from './Cache';
import {useState} from "react";

export default function useCache<T>(cacheKey : string, fallback : T = null, ttl : number = Cache.TTL_3_MONTHS) : [T, (x : T) => void] {
    const [val, stateSetter] = useState(cache.get(cacheKey, fallback));
    const setter = (val : T) => {
        if (val == null) {
            cache.remove(cacheKey);
        } else {
            cache.set(cacheKey, val, ttl);
        }

        return stateSetter(val);
    }

    return [val, setter];
};

export function useLocalStorage<T>(cacheKey : string, fallback : T = null) {
    return useCache(cacheKey, fallback, Cache.TTL_FOREVER);
}