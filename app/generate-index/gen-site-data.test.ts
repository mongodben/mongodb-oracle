import axios from "axios";
import {
  getPageData,
  getHtmlPages,
  parseSitemapToUrlList,
  snootyHtmlToText,
  snootyHtmlToMarkdown,
} from "./gen-site-data";

import { NodeHtmlMarkdown } from "node-html-markdown";
import { snootyMarkdownTranslator } from "./snootyMarkdownTranslator";

test("parses all files in site", async () => {
  const testUrl =
    "https://www.mongodb.com/docs/drivers/node/current/sitemap.xml";
  const { data: xml } = await axios.get(testUrl);
  const urls = await parseSitemapToUrlList(xml);
  const pages = await getHtmlPages(urls);
  const parsedPages = pages.map(({ url, htmlPage }) => ({
    url,
    textPage: snootyHtmlToText(htmlPage),
  }));
  expect(urls.length).toBe(pages.length);
  expect(urls.length).toBe(parsedPages.length);
});
test("fetches a single page", async () => {
  const testUrl =
    "https://www.mongodb.com/docs/drivers/java/sync/current/fundamentals/auth/";

  const pageData = await getPageData(testUrl);
  expect(pageData.url).toBe(testUrl);
});

test("custom codeblock language markdown", async () => {
  const codeElement =
    '<div class="leafygreen-ui-1th51br"><pre class="leafygreen-ui-vbfbru" tabindex="-1"><code class="lg-highlight-hljs-light java leafygreen-ui-1xcl9uc"><table class="leafygreen-ui-1v41da1"><tbody><tr class="leafygreen-ui-16qp2hh"><td class="leafygreen-ui-7razhx"><span class="lg-highlight-type">MongoCredential</span> <span class="lg-highlight-variable">credential</span> <span class="lg-highlight-operator">=</span> MongoCredential.createAwsCredential(<span class="lg-highlight-literal">null</span>, <span class="lg-highlight-literal">null</span>);</td></tr><tr class=""><td class="leafygreen-ui-7razhx"><div class="leafygreen-ui-ihxujy"></div></td></tr><tr class=""><td class="leafygreen-ui-7razhx"><span class="lg-highlight-type">MongoClient</span> <span class="lg-highlight-variable">mongoClient</span> <span class="lg-highlight-operator">=</span> MongoClients.create(</td></tr><tr class=""><td class="leafygreen-ui-7razhx">        MongoClientSettings.builder()</td></tr><tr class=""><td class="leafygreen-ui-7razhx">        .applyToClusterSettings(builder -&gt;</td></tr><tr class=""><td class="leafygreen-ui-7razhx">        builder.hosts(Arrays.asList(<span class="lg-highlight-keyword">new</span> <span class="lg-highlight-title lg-highlight-class">ServerAddress</span>(<span class="lg-highlight-string">"&lt;atlasUri&gt;"</span>))))</td></tr><tr class="leafygreen-ui-16qp2hh"><td class="leafygreen-ui-7razhx">        .credential(credential)</td></tr><tr class=""><td class="leafygreen-ui-7razhx">        .build());</td></tr></tbody></table></code></pre><div class="leafygreen-ui-16sacod" data-testid="leafygreen-code-panel"><button aria-label="Copy" tabindex="0" aria-disabled="false" class="leafygreen-ui-yvnu8j"><div class="leafygreen-ui-xhlipt"><svg class="leafygreen-ui-13p6dfv" height="16" width="16" role="img" aria-label="Copy Icon" viewBox="0 0 16 16"><path fill-rule="evenodd" clip-rule="evenodd" d="M1 5.71428V10.2857C1 11.2325 1.76751 12 2.71429 12H5.75V7.10957C5.75 6.54414 5.97724 6.00244 6.38065 5.60623L8.67403 3.35381C8.77447 3.25516 8.88376 3.16757 9 3.09182V2.71429C9 1.76751 8.23249 1 7.28571 1H5.8V4.42857C5.8 5.13865 5.22437 5.71428 4.51429 5.71428H1ZM9 4.78571L7.25654 6.49804C7.24689 6.50752 7.23749 6.5172 7.22834 6.52708C7.22208 6.53383 7.21594 6.54068 7.20991 6.54762C7.07504 6.70295 7 6.90234 7 7.10957V7.79762H9H10.0095C10.4829 7.79762 10.8667 7.41386 10.8667 6.94047V4H10.1505C9.92587 4 9.7102 4.0882 9.54992 4.24562L9 4.78571ZM4.86667 1H4.15053C3.92587 1 3.7102 1.0882 3.54992 1.24562L1.25654 3.49804C1.09244 3.65921 1 3.87957 1 4.10957V4.79762H4.00952C4.48291 4.79762 4.86667 4.41386 4.86667 3.94047V1ZM7 12V8.71428H9H10.5143C11.2244 8.71428 11.8 8.13865 11.8 7.42857V4H13.2857C14.2325 4 15 4.76751 15 5.71429V13.2857C15 14.2325 14.2325 15 13.2857 15H8.71429C7.76751 15 7 14.2325 7 13.2857V12Z" fill="currentColor"></path></svg></div></button></div></div>';

  const expectedMarkdown =
    "```java\n\n" +
    "MongoCredential credential = MongoCredential.createAwsCredential(null, null);\n\n" +
    "MongoClient mongoClient = MongoClients.create(\n\n" +
    "        MongoClientSettings.builder()\n\n" +
    "        .applyToClusterSettings(builder ->\n\n" +
    '        builder.hosts(Arrays.asList(new ServerAddress("<atlasUri>"))))\n\n' +
    "        .credential(credential)\n\n" +
    "        .build());\n\n\n" +
    "```";

  const nhm = new NodeHtmlMarkdown({}, snootyMarkdownTranslator, void 0);
  const result = nhm.translate(codeElement);

  expect(result).toBe(expectedMarkdown);
});

test("convert snooty html to Markdown", async () => {
  const testPage =
    "https://www.mongodb.com/docs/atlas/app-services/data-api/generated-endpoints/";
  const { data } = await axios.get(testPage);
  const md = snootyHtmlToMarkdown(data, "https://www.mongodb.com");
  expect(md.includes('"Permalink to this heading")')).toBe(false);
});
