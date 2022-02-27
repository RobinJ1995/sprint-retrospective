import React from 'react';

export default React.createContext({
    apiBaseUrl: undefined,
    retroId: undefined,
    lastSetAccessKey: undefined,
    advancedMode: false,
    debugLogging: false,
    getAuthHeaders: () => void 0
});