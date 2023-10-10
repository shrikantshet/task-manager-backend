# Project:
A backend to keep track of tasks.

# Brief Description:
CRUD APIs to manage tasks and API to get the metrics for tasks
- API to create a task
- API to update a task
- API to get all tasks (paginated)
- API to get task metrics like counts tasks on basis of status and timeline

NodeJS Version
> 18.18.0 (npm v9.8.1)

## Installation
1. Clone the repository
2. Run `npm install` to install dependencies
3. Ensure you have a `.env` file in the root directory. Copy .env.example as a template.
4. Create a Postgres database and update the .env file with the database credentials
5. Run `node ace migration:run` to run migrations
6. Optional Step - Run `node ace db:seed` to seed the database with some sample data
7. Run `node ace serve --watch` to start the local server

## Postman Collection
`Tasks.postman_collection.json` is the postman collection to test the APIs
