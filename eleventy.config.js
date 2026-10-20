import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import * as yaml from "js-yaml";

export default function(eleventyConfig) {
  // YAML support for data files
  eleventyConfig.addDataExtension("yml, yaml", (contents) => yaml.load(contents));
  // Syntax highlighting plugin
  eleventyConfig.addPlugin(syntaxHighlight);

  // Markdown-it configuration with anchor plugin
  const md = markdownIt({
    html: true,
    breaks: false,
    linkify: true
  }).use(markdownItAnchor, {
    slugify: (s) => String(s).trim().toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-"),
    tabIndex: false
  });
  eleventyConfig.setLibrary("md", md);

  // Passthrough static files
  eleventyConfig.addPassthroughCopy("tokens.css");
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("CNAME");

  // LiquidJS options
  eleventyConfig.setLiquidOptions({
    dynamicPartials: false,
    jekyllInclude: true,
    timezoneOffset: 0
  });

  // Custom filters
  eleventyConfig.addFilter("relative_url", (url) => url || "");
  eleventyConfig.addFilter("absolute_url", (url) => {
    if (!url) return "https://jaybhanushali.in";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    return `https://jaybhanushali.in${url.startsWith("/") ? "" : "/"}${url}`;
  });

  // Custom collection: tagList
  eleventyConfig.addCollection("tagList", function(collectionApi) {
    const posts = collectionApi.getFilteredByTag("posts");
    const tagMap = new Map();

    for (const post of posts) {
      const tags = post.data.tags || [];
      for (const tag of tags) {
        if (tag === "posts" || tag === "all") continue;
        if (!tagMap.has(tag)) {
          tagMap.set(tag, []);
        }
        tagMap.get(tag).push(post);
      }
    }

    const sortedTags = Array.from(tagMap.keys()).sort((a, b) => a.localeCompare(b));

    return sortedTags.map((tag) => {
      const tagPosts = tagMap.get(tag).slice().sort((a, b) => b.date - a.date);
      return {
        name: tag,
        posts: tagPosts
      };
    });
  });

  // Liquid template engine for xml and txt
  eleventyConfig.addExtension(["xml", "txt"], {
    key: "liquid"
  });

  // Ignores
  eleventyConfig.ignores.add(".github/**");
  eleventyConfig.ignores.add("README.md");
  eleventyConfig.ignores.add("docs/**");
  eleventyConfig.ignores.add(".claude/**");
  eleventyConfig.ignores.add(".agents/**");
  eleventyConfig.ignores.add(".hallmark/**");

  return {
    dir: {
      input: ".",
      includes: "_includes",
      layouts: "_layouts",
      data: "_data",
      output: "_site"
    },
    templateFormats: ["html", "md", "liquid", "xml", "txt"],
    htmlTemplateEngine: "liquid",
    markdownTemplateEngine: "liquid",
    dataTemplateEngine: "liquid"
  };
}
