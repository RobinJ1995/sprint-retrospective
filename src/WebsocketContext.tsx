import React from 'react';

export default React.createContext({
    wsSend: (msg: string) => undefined
});