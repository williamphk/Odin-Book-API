# Odin-Book-API

This is a RESTful API for a social network application built with Node.js, Express, and MongoDB. This API allows users to create and manage users, profiles, friend requests, posts, comments, and likes.

## API Endpoints

The API consists of the following endpoints:

### Users
- Register: `/users` (POST)
- Login with JWT: `/login` (POST)
- Login with Facebook: `/login/facebook` (GET)
- Get user details: `/users/:userId` (GET)
- Get user list: `/users` (GET)
- Update user: `/users/:userId` (PUT)
- Delete user: `/users/:userId` (DELETE)

### Friends
- Get user's friend list: `/users/:userId/friend` (GET)
- Get user's friend suggestion: `/users/:userId/friend/suggestion` (GET)
- Delete user's friend: `/users/:userId/friends/:friendId` (DELETE)

### Friend Requests
- Get friend request details: `/friend-requests/:friendRequestId` (GET)
- Get user's friend request list: `/friend-requests` (GET)
- Send friend request: `/friend-requests` (POST)
- Accept friend request: `/friend-requests/:friendRequestId/accept` (PUT)
- Reject friend request: `/friend-requests/:friendRequestId/reject` (PUT)
- Cancel friend request: `/friend-requests/:friendRequestId/` (DELETE)

### Posts
- Create post: `/posts` (POST)
- Get user's post list: `/posts` (GET)
- Get user's newsfeed : `/posts/newsfeed` (GET)
- Get post detail: `/posts/:postId` (GET)
- Update post: `/posts/:postId` (PUT)
- Delete post: `/posts/:postId` (DELETE)

### Comments
- Create comment: `/posts/:postId/comments` (POST)
- Get comment: `/posts/:postId/comments/:commentId` (GET)
- Get post's comment list: `/posts/:postId/comments` (GET)
- Update comment: `/posts/:postId/comments/:commentId` (PUT)
- Delete comment: `/posts/:postId/comments/:commentId` (DELETE)

### Likes
- Add like to post: `/posts/:postId/likes` (POST)
- Remove like from post: `/posts/:postId/likes/:likeId` (DELETE)
- Add like to comment: `/posts/:postId/comments/:commentId/likes` (POST)
- Remove like from comment: `/posts/:postId/comments/:commentId/likes/:likeId` (DELETE)

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
    
        JWT_SECRET=<your_jwt_secret>
        
        FB_APP_ID=<your facebook app id>
        
        FB_APP_SECRET=<your facebook app secret>

5. Run the development server:

        npm run dev

The server will run on the specified port, and you can access the API endpoints via a REST client like [Postman](https://www.postman.com/).

## Built With

- [Node.js](https://nodejs.org/en) - JavaScript runtime
- [Express](https://expressjs.com/) - Web framework for Node.js
- [MongoDB](https://www.mongodb.com/) - NoSQL database

## Contributing

Please feel free to submit issues or pull requests for any bugs or improvements.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements
- [The Odin Project](https://www.theodinproject.com/)
