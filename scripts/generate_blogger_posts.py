import json
import os
from datetime import datetime

# Load the JSON
json_path = "public/data/editions/2026/1/edition-1.json"
with open(json_path, "r", encoding="utf-8") as f:
    data = json.load(f)

# Start building the Atom XML for Blogger import
xml_content = f"""<?xml version='1.0' encoding='UTF-8'?>
<feed xmlns='http://www.w3.org/2005/Atom' xmlns:openSearch='http://a9.com/-/spec/opensearchrss/1.0/' xmlns:georss='http://www.georss.org/georss' xmlns:thr='http://purl.org/syndication/thread/1.0'>
  <id>tag:blogger.com,1999:blog-99999999999.archive</id>
  <updated>2026-07-05T12:00:00.000Z</updated>
  <title type='text'>A Crônica Ilustrada</title>
  <generator version='7.00' uri='http://www.blogger.com'>Blogger</generator>
"""

# Base URL for assets since they won't be on Blogger
base_url = "https://www.acronicailustrada.com.br/"
post_index = 1

# 1. Articles loop (Main feed)
for article in data.get("articles", []):
    title = article.get("title", "")
    subtitle = article.get("subtitle", "")
    author = article.get("author", "Redação")
    img_url = base_url + article.get("illustrationUrl", "") if article.get("illustrationUrl") else ""
    img_caption = article.get("illustrationCaption", "")
    content = article.get("content", [])
    
    html_body = ""
    if subtitle:
        html_body += f'<h3 class="article-subtitle">{subtitle}</h3>\n'
    if img_url:
        html_body += f'<img src="{img_url}" alt="Ilustração" />\n'
    if img_caption:
        html_body += f'<p class="image-caption">{img_caption}</p>\n'
        
    for j, paragraph in enumerate(content):
        if j == 0 and article.get("dropcap"):
            dropcap = article.get("dropcap")
            html_body += f'<p class="drop-cap"><span style="display:none">{dropcap}</span>{paragraph}</p>\n'
        else:
            html_body += f'<p>{paragraph}</p>\n'

    html_body = html_body.replace("]]>", "]]]]><![CDATA[>")

    xml_content += f"""
  <entry>
    <id>tag:blogger.com,1999:blog-99999999999.post-{post_index}</id>
    <published>2026-07-05T12:00:00.000Z</published>
    <updated>2026-07-05T12:00:00.000Z</updated>
    <category scheme="http://schemas.google.com/g/2005#kind" term="http://schemas.google.com/blogger/2008/kind#post"/>
    <title type='text'>{title}</title>
    <content type='html'>
      <![CDATA[{html_body}]]>
    </content>
    <author>
      <name>{author}</name>
    </author>
  </entry>
"""
    post_index += 1

# 2. General News loop (Telegramas)
# For Blogger layout, they must have the "Telegrama" tag. Scope can be a second tag.
for news in data.get("generalNews", []):
    title = news.get("title", "")
    scope = news.get("scope", "Notícia")
    content = news.get("content", "")
    author = "Redação"
    time = news.get("time", "12:00")
    
    # We will just write the content inside <p> as requested
    html_body = f'<p>{content}</p>'
    html_body = html_body.replace("]]>", "]]]]><![CDATA[>")
    
    xml_content += f"""
  <entry>
    <id>tag:blogger.com,1999:blog-99999999999.post-{post_index}</id>
    <published>2026-07-05T{time}:00.000Z</published>
    <updated>2026-07-05T{time}:00.000Z</updated>
    <category scheme="http://schemas.google.com/g/2005#kind" term="http://schemas.google.com/blogger/2008/kind#post"/>
    <category scheme="http://www.blogger.com/atom/ns#" term="Telegrama"/>
    <category scheme="http://www.blogger.com/atom/ns#" term="{scope}"/>
    <title type='text'>{title}</title>
    <content type='html'>
      <![CDATA[{html_body}]]>
    </content>
    <author>
      <name>{author}</name>
    </author>
  </entry>
"""
    post_index += 1

xml_content += "</feed>"

out_path = "bloggerTemplate/import-posts.xml"
with open(out_path, "w", encoding="utf-8") as f:
    f.write(xml_content)

print(f"Blogger import XML created with {post_index - 1} posts at {out_path}")
