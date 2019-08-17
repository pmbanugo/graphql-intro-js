## Introduction To GraphQL

This repository contains an implementation of a GraphQL server built on `graphql-yoga` and using Prisma as the data access layer. It covers GraphQL concepts such as query, mutation, subscription, and authentication. It has articles that accompanies it if you want to learn about GraphQL.

1. [Introduction to GraphQL: Schema, Resolvers, Type System, Schema Language, and Query Language (Part 1)](https://www.telerik.com/blogs/graphql-schema-resolvers-type-system-schema-language-query-language)
2. [Introduction to GraphQL: Mutation & DB access (Part 2)](https://www.telerik.com/blogs/graphql-mutation-and-database-access)
3. [Introduction To GraphQL: Subscriptions (Part 3)](#)
4. [Introduction To GraphQL: Authentication (Part 4)](#)

### Set up

This project uses Prisma as a data access layer. If you're not hosting your own Prisma server, you can [sign up](prisma.io) to Prisma cloud and host your Prisma server there. You'll need the Prisma CLI to deploy the data models. To in stall it, run `npm install -g prisma`. This project was built using version 1.28.3 of the Prisma CLI.

Open the command line and switch to the directory of this project. Run `npm install` to install the dependency from npm. Run the command `cd src/prisma` to switch to the Prisma directory. Then run `prisma deploy` to deploy the data model to a Prisma server. This will prompt you to select where to deploy. Select the **Demo Server** option if you want to deploy it to Prisma cloud.

Once set up, you can now start the server

### Starting the server

Starting the GraphQL server is simply running `node src/index.js` on the root directory of the project.
