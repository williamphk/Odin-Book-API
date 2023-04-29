# Odin-Book-API

This is a RESTful API for a social network application built with Node.js, Express, and MongoDB. This API allows users to create and manage users, profiles, friend requests, posts, comments, and likes.

## Getting Started
These instructions will help you set up and run the project on your local machine for development and testing purposes.

## Prerequisites
Node.js: Install the latest LTS version of [Node.js](https://nodejs.org/en/download).

MongoDB: Install [MongoDB](https://www.mongodb.com/try/download/community) locally or set up a free MongoDB Atlas cluster.

## Installation
1. Clone the repository to your local machine:

        git clone https://github.com/yourusername/Odin-Book-API.git

        cd odin-book-api

2. install the dependencies:

        npm install

3. Create a .env file in the root directory of the project and add your environment variables:

        touch .env

4. Add the following variables to your .env file:

        MONGO_SECRET_KEY=<your_mongodb_secret_key>
    
        SECRET=<your_jwt_secret>

5. Run the development server:

        npm run dev

The server will run on the specified port, and you can access the API endpoints via a REST client like [Postman](https://www.postman.com/).

## API Endpoints

The API consists of the following endpoints:

- Users: Create, update, delete users, and authenticate users.
- Profiles: Create, update, delete, and get user profiles.
- Friend Requests: Send, accept, reject, and cancel friend requests.
- Posts: Create, update, delete, and get user posts.
- Comments: Create, update, delete, and get post comments.
- Likes: Add and remove likes on posts and comments.

Refer to the routes folder for more information about the specific endpoints, HTTP methods, and required parameters.

## Built With

- [Node.js](https://nodejs.org/en) - JavaScript runtime
- [Express](https://expressjs.com/) - Web framework for Node.js
- [MongoDB](https://www.mongodb.com/) - NoSQL database

## Contributing

Please feel free to submit issues or pull requests for any bugs or improvements.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
