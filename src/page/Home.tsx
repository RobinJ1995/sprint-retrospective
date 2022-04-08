import React, { useState } from 'react';
import {httpPost} from '../utils';
import PreviousRetrospectives from "../PreviousRetrospectives";
import CreateNewRetrospective from "../CreateNewRetrospective";


const Home = ({
                  cache,
                  apiBaseUrl,
                  showErrorToast
              }) => {

    return <main id="home-page">
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
    </main>;
};

export default Home;
