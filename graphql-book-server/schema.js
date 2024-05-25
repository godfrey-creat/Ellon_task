const { GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLList, GraphQLSchema, GraphQLNonNull } = require('graphql');
const { books } = require('./data');

const TokenType = new GraphQLObjectType({
	name: 'Token',
	fields: () => ({
		position: { type: new GraphQLList(GraphQLInt) },
		value: { type: GraphQLString }
	})
});

const PageType = new GraphQLObjectType({
	name: 'Page',
	fields: () => ({
		number: { type: GraphQLInt },
		content: { type: GraphQLString },
		tokens: { type: new GraphQLList(TokenType) }
	})
});

const BookType = new GraphQLObjectType({
	name: 'Book',
	fields: () => ({
		id: { type: GraphQLString },
		title: { type: GraphQLString },
		author: { type: GraphQLString },
		pages: { type: new GraphQLList(PageType) }
	})
});

const RootQuery = new GraphQLObjectType({
	name: 'RootQueryType',
	fields: {
		book: {
			type: BookType,
			args: { id: { type: GraphQLString } },
			resolve(parent, args) {
				return books.find(book => book.id === args.id);
			}
		},
		books: {
			type: new GraphQLList(BookType),
			resolve() {
				return books;
			}
		}
	}
});

module.exports = new GraphQLSchema({
	query: RootQuery
});
