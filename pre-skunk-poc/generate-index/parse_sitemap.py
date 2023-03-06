import xmltodict

with open("sitemap.xml") as xml_file:
    data_dict = xmltodict.parse(xml_file.read())
    urls = data_dict['urlset']['url']
    locs = []
    for url_map in urls:
      locs.append(url_map['loc'])
    print(locs)
