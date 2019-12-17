module.exports = function(eleventyConfig) {
  const markdownIt = require("markdown-it");
  const markdownItContainer = require("markdown-it-container");
  const implicitFigures = require("markdown-it-implicit-figures");
  const markdownItAnchor = require("markdown-it-anchor");
  const cleanCSS = require("clean-css");
  const fs = require("fs");

  fs.copyFile("404.md", "_content/404.md", err => {
    if (err) throw err;
  });

  // markdown options
  const options = {
    html: true,
    breaks: true,
    linkify: true
  };

  const markdownLib = markdownIt(options)
    .use(markdownItAnchor, {})
    .use(implicitFigures, {
      figcaption: true
    })
    .use(markdownItContainer, "note")
    .use(markdownItContainer, "caution")
    .use(markdownItContainer, "col")
    .use(markdownItContainer, "two-col")
    .use(markdownItContainer, "three-col");
  eleventyConfig.setLibrary("md", markdownLib);

  /* Removes the h1 element from components to enabled inserting live sample */
  eleventyConfig.addNunjucksFilter("removeHeader", function(value) {
    value.val = value.val.replace(/<h1>(.*)<\/h1>/, "");
    return value;
  });

  eleventyConfig.addNunjucksFilter("figureIt", function(value) {
    let figcount = 1;

    const els = value.val.split("\n").map(el => {
      if (el.includes("figure")) {
        return el.replace("figcaption", `figcaption id="figure-${(figcount += 1)}"`);
      } else {
        return el;
      }
    });

    value.val = els.join("\n");
    return value;
  });

  // Manually move static content
  eleventyConfig.addPassthroughCopy({ img: "img/_site" });
  eleventyConfig.addPassthroughCopy({ "_content/img": "img" });
  eleventyConfig.addPassthroughCopy({ "_content/img": "img" });
  eleventyConfig.addPassthroughCopy({ "_content/**/*/img/*": "components/img" });
  eleventyConfig.addPassthroughCopy("js");
  eleventyConfig.addPassthroughCopy("css");
  eleventyConfig.addPassthroughCopy("fonts");

  //
  eleventyConfig.setBrowserSyncConfig({
    callbacks: {
      ready: function(err, bs) {
        const content_404 = fs.readFileSync("_site/404.html");

        bs.addMiddleware("*", (req, res) => {
          // Provides the 404 content without redirect.
          res.write(content_404);
          res.end();
        });
      }
    }
  });

  // You can return your Config object (optional).
  return {
    dir: {
      input: "_content",
      data: "./_data",
      includes: "../_includes"
    }
  };
};
