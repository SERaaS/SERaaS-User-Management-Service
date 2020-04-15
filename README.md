# SERaaS' User Management Service

Node.js Web API service for handling generic user authentication and storage requirements for Speech Emotion Recognition as a Service (SERaaS).

SERaaS is a Final Year Project for [Waterford Institute of Technology](https://www.wit.ie/) developed by [Wei Kit Wong](https://github.com/andyAndyA), which aims to provide a Speech Emotion Recognition as a Web API service. To use the service, a client must register for an user account via the [Web Platform](https://github.com/andyAndyA/SERaaS-Web-Platform), which is integrated with this User Management Service to provide registration and authentication for both the web platform and the main SERaaS API. In addition to user account management, SERaaS' API calls data are stored as Timestamps in this Web API service, which is used for visualising usage history data from the web platform.

## General

### Technologies Used

* *Node.js (v10.19.0)* - JavaScript Runtime
* *Swagger.js* - Node.js API Development Tool
* *MongoDB* - Database storage solution
* *Mongoose.js* - Middleware for simplifying MongoDB interaction

## Usage

Note that as the User Management Service is tightly coupled in its implementation with other SERaaS services, therefore there is little reason to use this other than for testing or learning purposes. The steps below assumes knowledge of Git cloning and installing NPM modules.

### Missing Files

Note that the following files are missing from the repo, and these must be introduced by yourself in order to run the service;

##### *mongodb-connectivity-uri.js*

This file is the connection string to the MongoDB client database, which the service will store their data in. To learn more about connection strings, go [here](https://docs.mongodb.com/manual/reference/connection-string/).

```
module.exports = 'yourMongoDatabaseURI';
```

##### *api/controllers/flushKey.js*

This file is used for the API endpoint `/authentication/flushdata/{secretKey}`. This is implemented as a basic security measure to prevent attackers from constantly performing the flush endpoint during production.

```
module.exports = 'yourFlushKey'
```

### Swagger Commands

* *swagger project test* - Runs all the unit tests in `test/api`
* *swagger project start* - Starts the service at port 4000

### API Endpoints

The API endpoints provided by this service can be inspected in `api/swagger/swagger.yaml` file.