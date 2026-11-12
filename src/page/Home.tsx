import React from 'react';
import Brand from '../Brand';
import PreviousRetrospectives from "../PreviousRetrospectives";
import CreateNewRetrospective from "../CreateNewRetrospective";


const Home = ({
                  cache,
                  apiBaseUrl,
                  showErrorToast
              }) => {

    return <>
        <header className="app-bar"><Brand /></header>
        <main id="home-page">
        <section className="create-new-retro">
            <h2>Create a new retrospective</h2>
            <CreateNewRetrospective
                apiBaseUrl={apiBaseUrl}
                showErrorToast={showErrorToast}
            />
        </section>
        <section className="previous-retros">
            <h2>Previous retrospectives</h2>
            <PreviousRetrospectives
                cache={cache}
                apiBaseUrl={apiBaseUrl}
            />
        </section>
        </main>
    </>;
};

export default Home;
