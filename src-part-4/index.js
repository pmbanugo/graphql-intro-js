const { GraphQLServer } = require("graphql-yoga");
const { prisma } = require("./prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const APP_SECRET = "GraphQL-Vue-React";

const typeDefs = `
type Book {
    id: ID!
    title: String!
    pages: Int
    chapters: Int
    authors: [Author!]!
}

type Author {
    id: ID!
    name: String!
    books: [Book!]!
}

type Query {
  books: [Book!]
  book(id: ID!): Book
  authors: [Author!]
}

type Mutation {
  book(title: String!, authors: [String!]!, pages: Int, chapters: Int): Book!
  signup(email: String!, password: String!, name: String!): AuthPayload
  signin(email: String!, password: String!): AuthPayload
}

type Subscription {
  newBook(containsTitle: String): Book!
}

type AuthPayload {
  token: String!
  user: User!
}

type User {
  id: ID!
  name: String!
  email: String!
}
`;

const resolvers = {
  Subscription: {
    newBook: {
      subscribe: (parent, args, context, info) => {
        let filter = { mutation_in: ["CREATED"] };
        if (args.containsTitle)
          filter.node = { title_contains: args.containsTitle };

        return context.prisma.$subscribe.book(filter).node();
      },
      resolve: payload => {
        return payload;
      }
    }
  },
  Mutation: {
    book: authenticate(async (root, args, context, info) => {
      let authorsToCreate = [];
      let authorsToConnect = [];

      for (const authorName of args.authors) {
        const author = await context.prisma.author({ name: authorName });
        if (author) authorsToConnect.push(author);
        else authorsToCreate.push({ name: authorName });
      }

      return context.prisma.createBook({
        title: args.title,
        pages: args.pages,
        chapters: args.chapters,
        authors: {
          create: authorsToCreate,
          connect: authorsToConnect
        }
      });
    }),
    signup: async (root, args, context, info) => {
      const password = await bcrypt.hash(args.password, 10);
      const user = await context.prisma.createUser({ ...args, password });
      const token = jwt.sign({ userId: user.id }, APP_SECRET);

      return {
        token,
        user
      };
    },
    signin: async (root, args, context, info) => {
      const user = await context.prisma.user({ email: args.email });
      if (!user) {
        throw new Error("No such user found");
      }
      const valid = await bcrypt.compare(args.password, user.password);
      if (!valid) {
        throw new Error("Invalid password");
      }

      const token = jwt.sign({ userId: user.id }, APP_SECRET);

      return {
        token,
        user
      };
    }
  },
  Query: {
    books: (root, args, context, info) => context.prisma.books(),
    book: (root, args, context, info) => context.prisma.book({ id: args.id }),
    authors: (root, args, context, info) => context.prisma.authors()
  },
  Book: {
    authors: (parent, args, context) =>
      context.prisma.book({ id: parent.id }).authors()
  },
  Author: {
    books: (parent, args, context) =>
      context.prisma.author({ id: parent.id }).books()
  }
};

const server = new GraphQLServer({
  typeDefs,
  resolvers,
  context: async ({ request }) => {
    let user;
    let isAuthenticated = false;
    // get the user token from the headers
    const authorization = request.get("Authorization");
    if (authorization) {
      const token = authorization.replace("Bearer ", "");
      // try to retrieve a user with the token
      user = await getUser(token);
      if (user) isAuthenticated = true;
    }

    // add the user and prisma client to the context
    return { isAuthenticated, user, prisma };
  }
});
server.start(() => console.log(`Server is running on http://localhost:4000`));

async function getUser(token) {
  const { userId } = jwt.verify(token, APP_SECRET);
  return await prisma.user({ id: userId });
}

// const authenticate = next => (root, args, context, info) => {
//   if (context.isAuthenticated) {
//     return next(root, args, context, info);
//   }
//   throw new Error(`Access Denied!`);
// };

function authenticate(resolver) {
  return function(root, args, context, info) {
    if (context.isAuthenticated) {
      return resolver(root, args, context, info);
    }
    throw new Error(`Access Denied!`);
  };
}
