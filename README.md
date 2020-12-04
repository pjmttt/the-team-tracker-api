# the-team-tracker-api
The backbones for The Team Tracker to be accessed by an angular web application (https://github.com/pjmttt/the-team-tracker) as well as a Xamarin mobile application (https://github.com/pjmttt/TheTeamTrackerMobile).

## Running Locally

Make sure you have [Node.js](http://nodejs.org/) installed.
Make sure you have [postgres](https://www.postgresql.org/) installed and a local database instance to be used.

```sh
git clone https://github.com/pjmttt/the-team-tracker-api.git # or clone your own fork
npm install
```

Create a file .env (use .env.sample for reference) and replace values as necessary.

Next run

```sh
sequelize db:migrate
npm start
```
