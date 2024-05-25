import React from 'react';
import { gql, useQuery } from '@apollo/client';
import Book from './components/Book';

const GET_BOOKS = gql`
	query GetBooks {
		books {
			id
			title
			author
			pages {
				number
				content
				tokens {
					position
					value
					}
				}
			}
		}
	`;

const App = => {
	const { loading, error, data } = useQuery(GET_BOOKS);
	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error :(</p>);

	return (
		<div>
			{data.books.map(book => (
				<Book key={book.id} book={book} />
			))}
		</duv>
	);
};

export default App;
