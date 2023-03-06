# MongoDB Oracle Backend

This project contains the source code for a serverless backend that accepts questions from a client and returns the answer.

## Set Up

TODO

## Develop

TODO

## Deploy

TODO

## Architecture

The way the backend works is:

1. Get question from a client.
1. Convert the question to an embedding using `TBD`.
1. Query Atlas Search using the embedding and the Atlas Search knnBeta.
1. Include the n highest ranking results from the Atlas Search result to generate a prompt with list of items for GPT-3 to summarize.
1. Send request to GPT-3 API to respond to the summary prompt. GPT-3 returns the summary.
1. Return the GPT-3 summary to the client that made the request.
