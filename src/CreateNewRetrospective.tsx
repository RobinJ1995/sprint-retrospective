import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {checkHttpStatus, getAuthHeaders, httpCheckParse, httpPost} from './utils';
import MDSpinner from "react-md-spinner";
import {VOTE_MODES, HEADERS, DEFAULT_HEADERS, RETRO_TITLE_MIN_LENGTH, RETRO_TITLE_MAX_LENGTH} from "./constants";
import { v4 as uuid } from 'uuid';
import Promise from 'bluebird';
import Icon from './Icon';


const CreateNewRetrospective = ({
    apiBaseUrl,
    showErrorToast
}) => {
    const [title, setTitle] = useState<string>('');
    const [voteMode, setVoteMode] = useState<string>(VOTE_MODES.UPVOTE);

    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    const createRetro = useMemo(() => async () => {
        const titleSanitised: string | undefined = title?.trim()
            ?.toLowerCase()
            ?.replace(/[^a-z0-9]/ig, '-')
            ?.replace(/-{2,}/g, '-');
        const retroId: string = titleSanitised ? `${uuid()}-${titleSanitised}` : uuid();
        const retroUrl: string = `${window.location.origin}/${retroId}`;

        try {
            const headers = await fetch(`${apiBaseUrl}${retroId}/authenticate`, {
                method: 'POST'
            })
                .then(httpCheckParse)
                .then((response: any) => response.token)
                .then(token => ({
                    ...DEFAULT_HEADERS,
                    [HEADERS.TOKEN]: token
                }));

            if (title) {
                await fetch(`${apiBaseUrl}${retroId}/title`, {
                    method: 'PUT',
                    headers,
                    body: JSON.stringify({
                        title
                    })
                } as RequestInit).then(checkHttpStatus);
            }

            await fetch(`${apiBaseUrl}${retroId}/voteMode`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({
                    voteMode
                })
            } as RequestInit).then(checkHttpStatus);

            window.location.href = retroUrl;
        } catch (ex) {
            setError(ex);
            showErrorToast(ex);
        }
    }, [title, voteMode, setError, showErrorToast]);

    const submit = useCallback(async e => {
        try {
            e.preventDefault();
            setLoading(true);
            await createRetro();
        } catch (ex) {
            setError(ex);
            showErrorToast(ex);
        } finally {
            setLoading(false);
        }
    }, [createRetro, setLoading, setError, showErrorToast]);

    const voteModeOption = (mode: string, icon: string, label: string) => (
        <label className={`choice ${voteMode === mode ? 'selected' : ''}`}>
            <input
                type="radio"
                name="vote-mode"
                value={mode}
                checked={voteMode === mode}
                readOnly
            />
            <span className="choice-icon emoji" role="img" aria-hidden="true">{icon}</span>
            <span className="choice-text">{label}</span>
            <span className="choice-check"><Icon name="check" /></span>
        </label>
    );

    return <form id="create-new-retro" className={loading ? 'loading' : ''} onSubmit={submit}>
        <div>
            <div className="form-row title">
                <label>
                    <span className="field-label">Retrospective name:</span>
                    <input
                        className="input"
                        type="text"
                        placeholder="Sprint 42"
                        name="title"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        minLength={RETRO_TITLE_MIN_LENGTH}
                        maxLength={RETRO_TITLE_MAX_LENGTH}
                    />
                </label>
            </div>
            <div className="form-row vote-mode">
                <span className="field-label">Voting mode:</span>
                <div className="options" onChange={e => setVoteMode((e.target as any).value)}>
                    {voteModeOption(VOTE_MODES.UPVOTE_DOWNVOTE, '👍👎', 'Upvotes and downvotes')}
                    {voteModeOption(VOTE_MODES.UPVOTE, '👍', 'Upvotes only')}
                    {voteModeOption(VOTE_MODES.NONE, '🚫', 'Disable voting')}
                </div>
            </div>
            <div className="create">
                {loading
                    ? <MDSpinner size={48} />
                    : <button className="button primary large">Create retrospective</button>}
            </div>
        </div>
    </form>;
};

export default CreateNewRetrospective;
