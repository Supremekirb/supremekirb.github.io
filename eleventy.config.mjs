import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";

export default async function (eleventyConfig) {
    eleventyConfig.setInputDirectory("blog-backend")
    eleventyConfig.setOutputDirectory("blog")
    eleventyConfig.addShortcode("prettyDate", function() {
        return (this.page.date.toLocaleDateString())
    })
    eleventyConfig.addPlugin(syntaxHighlight)
}