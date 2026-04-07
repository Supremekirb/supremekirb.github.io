import pluginRss from "@11ty/eleventy-plugin-rss";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";

export default async function (eleventyConfig) {
    eleventyConfig.setInputDirectory("blog-backend")
    eleventyConfig.setOutputDirectory("blog")
    eleventyConfig.addShortcode("prettyDate", function () {
        return (this.page.date.toLocaleDateString())
    })
    eleventyConfig.addFilter("concat", function(a, b) {
        return a + b;
    })
    eleventyConfig.addPlugin(syntaxHighlight)
    // eleventyConfig.addPlugin(feedPlugin, {
    //     type: "rss",
    //     outputPath: "/feed.xml",
    //     collection: {
    //         name: "all",
    //         limit: 0, // Unlimited
    //     },
    //     metadata: {
    //         language: "en",
    //         title: "Kirb's blog",
    //         subtitle: "Blog from supremekirb.neocities.org/blog",
    //         base: "https://supremekirb.neocities.org/blog/",
    //         author: {
    //             name: "SupremeKirb"
    //         }
    //     }
    // })
    eleventyConfig.addPlugin(pluginRss)
}