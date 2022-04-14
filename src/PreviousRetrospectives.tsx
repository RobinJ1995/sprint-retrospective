import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {getAuthHeaders, httpCheckParse} from './utils';
import MDSpinner from "react-md-spinner";


const PreviousRetrospective = ({
    cache,
    apiBaseUrl,
    retroId
}) => {
    const [retroData, setRetroData] = useState<any>(null);
    const [loaded, setLoaded] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);

    const fetchRetroData = useMemo(() => async () => {
        try {
            return await fetch(`${apiBaseUrl}${retroId}`, {
                headers: getAuthHeaders(retroId)
            } as RequestInit).then(httpCheckParse);
        } catch (ex) {
            const retroDataFromCache = cache.get(retroId, null);
            if (retroDataFromCache) {
                return retroDataFromCache;
            }

            throw ex;
        }
    }, [retroId, cache, apiBaseUrl]);

    useEffect(() => {
        fetchRetroData()
            .then(data => {
                setRetroData(data);
                setLoaded(true);
            })
            .catch(setError);
    }, [fetchRetroData, setRetroData, setLoaded, setError]);

    const nGood = retroData?.good?.length ?? 0;
    const nBad = retroData?.bad?.length ?? 0;
    const nActions = retroData?.actions?.length ?? 0;
    const nComments = [retroData?.good, retroData?.bad, retroData?.actions]
        .flatMap(x => x)
        .map(x => x?.comments ?? [])
        .flatMap(x => x)
        .length;
    const hasTitle = !!retroData?.title;
    const retroUrl = `${window.location.origin}/${retroId}`;
    const navigateToRetro = useCallback(() => {
        window.location.href = retroUrl;
    }, [retroUrl]);

    if (error) {
        return <li className="previous-retro error" onClick={navigateToRetro}><a href={retroUrl}>Error retrieving information for {retroId}: {error.toString()}</a></li>;
    } else if (loaded && retroData) {
        if (!hasTitle && (nGood + nBad + nActions + nComments === 0)) {
            // Retro wasn't used. No point showing it.
            return <span />;
        }

        return <li className="previous-retro loaded" onClick={navigateToRetro}><a href={retroUrl} className={`name ${hasTitle ? 'title' : ''}`}>{retroData?.title ?? retroId}</a><ul>
            <li title={`${nGood} things went well`}><span role="img" aria-label="Good">🤩</span> {nGood}</li>
            <li title={`${nBad} could have been done better`}><span role="img" aria-label="Bad">🤨</span> {nBad}</li>
            <li title={`${nActions} action items`}><span role="img" aria-label="Actions">☑️</span> {nActions}</li>
            <li title={`${nComments} comments`}><span role="img" aria-label="Comments">💬</span> {nComments}</li>
        </ul></li>;
    } else if (!loaded) {
        return <li className="previous-retro loading" onClick={navigateToRetro}><MDSpinner /> <a href={retroUrl}>{retroId}</a></li>;
    } else {
        return <li onClick={navigateToRetro}><a href={retroUrl}>{retroId}</a></li>;
    }
};


const PreviousRetrospectives = ({
                  cache,
                  apiBaseUrl
              }) => {

    const cacheKeys: string[] = cache.keys();
    // Hacky but it'll do for now.
    const retroIds: string[] = cacheKeys.filter(retroId => cacheKeys.includes(`${retroId}:token`));

    return <ul className="previous-retros">
        {retroIds.map(retroId => <PreviousRetrospective
            retroId={retroId}
            cache={cache}
            apiBaseUrl={apiBaseUrl}
        />)}
    </ul>
};

export default PreviousRetrospectives;
