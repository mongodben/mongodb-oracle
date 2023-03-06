from gpt_index import GPTSimpleVectorIndex
from gpt_index.readers import SimpleWebPageReader
from dotenv import load_dotenv
import xmltodict

load_dotenv()
with open("sitemap.xml") as xml_file:
  data_dict = xmltodict.parse(xml_file.read())
  urls = data_dict['urlset']['url']
  locs = []
  for url_map in urls:
    locs.append(url_map['loc'])

  reader = SimpleWebPageReader(html_to_text=True)
  docs = reader.load_data(locs)

  index = GPTSimpleVectorIndex(docs)

  index.save_to_disk('index.json')
