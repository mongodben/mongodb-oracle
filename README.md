<div style="text-align: center;">
<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="assets/mongodb-oracle-logo.png" width="200"></a>
<br/>
<br/>
</div>

# The MongoDB Oracle

MongoDB Docs Q&A Bot

## Skunkworks March 2023 MVP

The MVP to be completed during Skunkworks March 2023 (Skunkalodeon) should have the following components:

### Web Frontend

- [ ] React frontend made with Leafygreen UI and Next.js
- [ ] Basic chat interface (similar to text messaging app)
- [ ] Query the web server backend
- [ ] Run locally and deploy to web hosting (Netlify, Vercel, etc.)

Notable not doing:

- Session persistence
- Authentication
- Mobile responsive

### Web Server Backend

- [ ] TypeScript/Next.js server routes with endpoint to respond to natural language user queries in natural language response
      with accurate data from the indexed site. Format answers in Markdown with links to relevant content on the site.
   - Use AI embedding API to create and query embeddings for site data. Use Atlas Search `$knnBeta` operator for this.
   - Use LLM AI to summarize results from query.
- [ ] Hosting/deployment covered by whichever Next.js hosting platform decided (Netlify, Vercel, etc.)

### Index Search Data

- [ ] Script(s) to index data from local machine. Use vector embedding API for this. maybe OpenAI?

### Data Layer - MongoDB Atlas with Atlas Search

- [ ] Store site data in MongoDB Atlas.
- [ ] Use Atlas Search with the [knnBeta](https://www.mongodb.com/docs/atlas/atlas-search/knn-beta/) to query embeddings.
- [ ] Set up development and production cluster
- [ ] Create script to automate index creation

### Post MVP Features

Once we finish the above MVP, some other nice features to add during Skunkworks could include:

- [ ] UI feedback on good/bad recommendations
- [ ] Multiple user interfaces. Slack bot, Discord bot, etc.
- [ ] Deployment wizard to get set up easily (similar to what we did with Atlas Static Site Search)
- [ ] Hack the UI into MongoDB nav bar.
- [ ] Endpoint(s) to index data
- [ ] Minimal API key auth (can be just static environmental variable(s))

## Understand this repo

Monorepo made with [nx](https://nx.dev/getting-started/intro).
Run `npx nx graph` to see a diagram of the dependencies of the projects.
