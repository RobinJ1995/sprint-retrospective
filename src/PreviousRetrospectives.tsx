import React, {useEffect, useMemo, useState} from 'react';
import {getAuthHeaders, httpCheckParse, httpPost} from './utils';
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
    }, [retroId, cache]);

    useEffect(() => {
        fetchRetroData()
            .then(data => {
                setRetroData(data);
                setLoaded(true);
            })
            .catch(setError);
    }, [fetchRetroData, setRetroData, setLoaded, setError])

    const nGood = retroData?.good?.length ?? 0;
    const nBad = retroData?.bad?.length ?? 0;
    const nActions = retroData?.actions?.length ?? 0;
    const nComments = [retroData?.good, retroData?.bad, retroData?.actions]
        .map(x => x?.comments)
        .map(x => !!x)
        .flatMap(x => x)
        .length;

    if (error) {
        return <li>{error?.message ?? `${retroId}: Error`}</li>;
    } else if (loaded && retroData) {
        return <li>{retroData?.title ?? retroId}<ul>
            <li><span role="img" aria-label="Thumb up">👍</span> {nGood}</li>
            <li><span role="img" aria-label="Thumb down">👎</span> {nBad}</li>
            <li><span role="img" aria-label="Action items">☑️</span> {nActions}</li>
            <li><span role="img" aria-label="Comments">💬</span> {nComments}</li>
        </ul></li>;
    } else if (!loaded) {
        return <li><MDSpinner /> {retroId}</li>;
    } else {
        return <li>{retroId}</li>;
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
