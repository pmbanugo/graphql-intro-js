const { GraphQLServer } = require("graphql-yoga");
const { prisma } = require("./prisma/client");

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
}
`;

const resolvers = {
  Mutation: {
    book: async (root, args, context, info) => {
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
  context: { prisma }
});
server.start(() => console.log(`Server is running on http://localhost:4000`));
