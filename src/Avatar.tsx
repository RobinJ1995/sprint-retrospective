import React, {useCallback, useEffect, useMemo, useState} from 'react';
const Avatar = ({ emoji, location=null }) => {
    return <span
        role="img"
        className={['avatar', location ? 'typing' : null].filter(x => !!x).join(' ')}>{emoji}</span>;
};

export default Avatar;
