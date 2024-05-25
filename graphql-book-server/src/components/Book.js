import React, { useState } from 'react';

const Book = ({ book }) => {
	const [currentPage, setCurrentPage] = useState(0);

	const handleNextPage = () => {
		if (currentPage < book.pages.length - 1) {
			setCurrentPage(currentPage + 1);
		}
	};

	const handlePrevPage = () => {
		if (currentPage > 0) {
			setCurrentPage(currentPage - 1);
		}
	};

	const handleWordClick = (word) => {
		alert(`Token: ${word.value}`);
	};

	const renderContent = (page) => {
		let lastIndex = 0;
		return page.tokens.map((token, index) => {
			const start = page.content.substring(lastIndex, token.position[0]);
			const word = page.content.substring(token.position[0], token.position[1] + 1);
			lastIndex = token.position[1] + 1;

			return (
				<React.Fragment key={index}>
					{start}
					<span style={{ cursor: 'pointer', color: 'blue' }} onclick={() => handleWordClick(token)}>
						{word}
					</span>
				</React.Fragment>
			);
		});
	};

	return (
		<div>
			<h2>{book.title}</h2>
			<h3>{book.author}</h3>
			<div>
				<button onClick={handlePrevPage} disabled={currentPage === 0}>Previous</button>
