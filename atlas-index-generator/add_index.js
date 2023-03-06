const { request } = require('urllib');
require ('dotenv').config({ path: ".env.dev" });

const { GROUP_ID, CLUSTER_NAME, DB_NAME, COLL_NAME, ATLAS_ADMIN_API_KEY, ATLAS_ADMIN_API_SECRET } = process.env 

const baseUrl = "https://cloud.mongodb.com/api/atlas/v1.0"
const requestParams = "pretty=true"

const payload = { 
 "name": "knnTestIndex",
 "database": DB_NAME,
 "collectionName": COLL_NAME,
 "mappings": {
    "dynamic": true,
    "fields": {
      "embedding": {
        "dimensions": 1024,
        "similarity": "cosine",
        "type": "knnVector"
      }
    }
  }
}

const requestUrl = `${baseUrl}/groups/${GROUP_ID}/clusters/${CLUSTER_NAME}/fts/indexes?${requestParams}`;

(async () => {
  const { data, res } = await request(requestUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    digestAuth: `${ATLAS_ADMIN_API_KEY}:${ATLAS_ADMIN_API_SECRET}`,
    data: payload
  })

  console.dir(res);
})()
