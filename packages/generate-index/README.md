# doc_summary_ai

Prototype of using GPT index to answer questions in technical documentation.

## Get Started

Create `.env` file and add OpenAI API key to it:

```sh
# .env
OPENAI_API_KEY=<sk-...>
```

Install dependencies:

```sh
pip install -r requirements.txt
```

Run:

```sh
python main.py
```

## Add You Own Index

Right now the index just contains a couple of random documentation pages about [Atlas Functions](https://www.mongodb.com/docs/atlas/app-services/functions/).

You can find these pages in `gen_index.py` in the `urls` list.
If you want to change the pages indexed, you can just edit this list of links.

To regenerate the index, run:

```sh
python gen_index.py
```

## For Skunkworks

### mvp

- basic web interface
- UI toggle for human languages (Spanish, Portuguese, Japanese, Pirate)
- type of content (code block, how to, conceptual overview)

### stretch goals

- multi-tier index (global search, and search by site)
- continuous conversation
- and more?

### infra

- deploy python backend to Heroku or some other infra PaaS
- deploy frontend to Netlify
- set up [git lfs](https://git-lfs.com/) to track those big index files.
