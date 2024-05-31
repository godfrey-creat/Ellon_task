Project Overview

This project involves creating a full-stack application consisting of three main parts:

1. GraphQL Server: A Node.js server providing book information via GraphQL.
2. React Application: A front-end interface to display and interact with book content.
3. Infrastructure as Code (IaC): Deployment of the application using AWS and Terraform.

 Part 1: GraphQL Server

 Requirements

- Node.js: Ensure Node.js is installed on your machine.
- Libraries: Use libraries such as Express and Apollo Server for setting up the GraphQL server.

 Steps

1. Initialize Project: 
   ```bash
   npm init -y
   npm install express apollo-server-express graphql
   ```

2. Setup GraphQL Server:
   - Create an `index.js` file to define the server.
   - Define the GraphQL schema with types and queries for book information.
   - Implement resolvers to fetch book data from the provided resources.

3. Run the Server:
   ```bash
   node index.js
   ```

Example Code

```javascript
const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');

const books = [
  {
    title: "Book 1",
    author: "Author 1",
    pages: [
      { content: "Page 1 content", tokens: [...] },
      // more pages
    ],
  },
  {
    title: "Book 2",
    author: "Author 2",
    pages: [
      { content: "Page 1 content", tokens: [...] },
      // more pages
    ],
  },
];

const typeDefs = gql`
  type Token {
    position: [Int]
    value: String
  }

  type Page {
    content: String
    tokens: [Token]
  }

  type Book {
    title: String
    author: String
    pages: [Page]
  }

  type Query {
    books: [Book]
  }
`;

const resolvers = {
  Query: {
    books: () => books,
  },
};

const server = new ApolloServer({ typeDefs, resolvers });
const app = express();
server.applyMiddleware({ app });

app.listen({ port: 4000 }, () =>
  console.log(`Server ready at http://localhost:4000${server.graphqlPath}`)
);
```

Part 2: React Application

 Requirements

- Node.js: Ensure Node.js is installed on your machine.
- Libraries: Use Create React App for the React project setup.

 Steps

1. Initialize Project:
   ```bash
   npx create-react-app book-app
   cd book-app
   npm install @apollo/client graphql
   ```

2. Setup Apollo Client:
   - Configure Apollo Client to connect to the GraphQL server.

3. Create Components:
   - BookList: Fetch and display a list of books.
   - PageView: Display pages of a book with navigation.
   - TokenView: Display the token value when a word is clicked.

4. Implement Clickable Tokens:
   - Map tokens to the content.
   - Handle click events to show token values.

Example Code

```javascript
// src/App.js
import React from 'react';
import { ApolloProvider, InMemoryCache, ApolloClient } from '@apollo/client';
import BookList from './components/BookList';

const client = new ApolloClient({
  uri: 'http://localhost:4000/graphql',
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <BookList />
    </ApolloProvider>
  );
}

export default App;

// src/components/BookList.js
import React from 'react';
import { useQuery, gql } from '@apollo/client';
import PageView from './PageView';

const GET_BOOKS = gql`
  query GetBooks {
    books {
      title
      author
      pages {
        content
        tokens {
          position
          value
        }
      }
    }
  }
`;

function BookList() {
  const { loading, error, data } = useQuery(GET_BOOKS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error :(</p>;

  return data.books.map((book) => (
    <div key={book.title}>
      <h2>{book.title}</h2>
      <PageView pages={book.pages} />
    </div>
  ));
}

export default BookList;

// src/components/PageView.js
import React, { useState } from 'react';
import TokenView from './TokenView';

function PageView({ pages }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedToken, setSelectedToken] = useState(null);

  const handleTokenClick = (token) => {
    setSelectedToken(token);
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) => (prevPage + 1) % pages.length);
  };

  const renderContent = (content, tokens) => {
    const elements = [];
    let lastIndex = 0;
    
    tokens.forEach((token) => {
      const { position, value } = token;
      elements.push(content.slice(lastIndex, position[0]));
      elements.push(
        <span onClick={() => handleTokenClick(value)} style={{ cursor: 'pointer', color: 'blue' }}>
          {content.slice(position[0], position[1])}
        </span>
      );
      lastIndex = position[1];
    });

    elements.push(content.slice(lastIndex));

    return elements;
  };

  return (
    <div>
      <div>{renderContent(pages[currentPage].content, pages[currentPage].tokens)}</div>
      <button onClick={handleNextPage}>Next Page</button>
      {selectedToken && <TokenView token={selectedToken} />}
    </div>
  );
}

export default PageView;

// src/components/TokenView.js
import React from 'react';

function TokenView({ token }) {
  return (
    <div>
      <h3>Token Value:</h3>
      <p>{token}</p>
    </div>
  );
}

export default TokenView;
```

Part 3: Infrastructure as Code (IaC)

Requirements

- AWS CLI: Ensure AWS CLI is installed and configured.
- Terraform: Ensure Terraform is installed.

Steps

1. Setup Terraform Project:
   - Initialize a Terraform project.
   - Define AWS provider configurations.

2. Define Resources:
   - Define ECS Cluster, Task Definitions, and Services.
   - Configure Fargate to deploy the application.
   - Set up security groups, IAM roles, and necessary permissions.

3. Deploy Infrastructure:
   ```bash
   terraform init
   terraform apply
   ```

 Example Terraform Configuration

```hcl
provider "aws" {
  region = "us-east-1"
}

resource "aws_ecs_cluster" "book_app_cluster" {
  name = "book-app-cluster"
}

resource "aws_ecs_task_definition" "book_app_task" {
  family                   = "book-app-task"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([{
    name      = "book-app"
    image     = "your-docker-image-url"
    essential = true
    portMappings = [{
      containerPort = 80
      hostPort      = 80
    }]
  }])
}

resource "aws_ecs_service" "book_app_service" {
  name            = "book-app-service"
  cluster         = aws_ecs_cluster.book_app_cluster.id
  task_definition = aws_ecs_task_definition.book_app_task.arn
  desired_count   = 1

  launch_type = "FARGATE"

  network_configuration {
    subnets         = ["subnet-abc123"]
    security_groups = [aws_security_group.ecs_security_group.id]
  }
}

resource "aws_security_group" "ecs_security_group" {
  name        = "ecs_security_group"
  description = "Allow HTTP traffic"

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_iam_role" "ecs_task_execution_role" {
  name = "ecs_task_execution_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })

  managed_policy_arns = [
    "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
  ]
}
```

Conclusion

This project demonstrates creating a GraphQL server, a React application consuming the server, and deploying the application using AWS and Terraform. Follow best practices for clean code, efficient state management, and proper resource configuration in Terraform.
