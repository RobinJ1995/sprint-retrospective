# Sprint Retrospective

This is the frontend of the [sprintretro.app](https://sprintretro.app/) application for collaborating on sprint retrospectives.

The frontend talks to [an API](https://github.com/RobinJ1995/sprint-retrospective-server) and a [websocket server component](https://github.com/RobinJ1995/sprint-retrospective-websocket-server).

## Running locally

In order to run the application and all its backend components locally...

1. Ensure you are using Node.js 15
2. `npm install`
    - If you ran `npm install` before switching to Node.js 15, blow away the `node_modules` folder and run `npm install` again.
3. Run `./dev.sh`
   - This script will build Docker images for (frontend and backend) components, and start a dev server for the frontend.
