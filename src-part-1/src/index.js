const { GraphQLServer } = require("graphql-yoga");

const typeDefs = `
type Book {
    id: Int!
    title: String!
    pages: Int
    chapters: Int
}

type Query {
  books: [Book!]
  book(id: Int!): Book
}
`;

const books = [
  {
    id: 1,
    title: "Fullstack tutorial for GraphQL",
    pages: 356
  },
  {
    id: 2,
    title: "Introductory tutorial to GraphQL",
    chapters: 10
  },
  {
    id: 3,
    title: "GraphQL Schema Design for the Enterprise",
    pages: 550,
    chapters: 25
  }
];

const resolvers = {
  Query: {
    books: (root, args, context, info) => books,
    book: (root, args, context, info) => books.find(e => e.id === args.id)
  },

  Book: {
    id: parent => parent.id,
    title: parent => parent.title,
    pages: parent => parent.pages,
    chapters: parent => parent.chapters
  }
};

const server = new GraphQLServer({
  typeDefs,
  resolvers
});
server.start(() => console.log(`Server is running on http://localhost:4000`));
