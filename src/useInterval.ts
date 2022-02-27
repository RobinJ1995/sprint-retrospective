import {useEffect, useRef} from "react";

export default function useInterval(callback: () => void, delay: number | null | false, immediate: boolean = false, dependencies: any[] = []) {
    const savedCallback = useRef(() => {});

    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback;
    });

    // Execute callback if immediate is set.
    useEffect(() => {
        if (!immediate) {
            return;
        } else if (delay === null || delay === false) {
            return;
        }

        savedCallback.current();
    }, [immediate]);

    // Set up the interval.
    useEffect(() => {
        if (delay === null || delay === false) {
            return undefined;
        }

        const tick = () => savedCallback.current();
        const id = setInterval(tick, delay);
        return () => clearInterval(id);
    }, [delay, ...dependencies]);
};
