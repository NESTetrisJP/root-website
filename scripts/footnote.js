hexo.extend.filter.register("after_post_render", (data) => {
  let content = data.content
  const slug = data.slug
  content = content.replace(/#fn(\d+)/g, "#fn-" + slug + "-$1")
  content = content.replace(/id="fn(\d+)"/g, "id=\"fn-" + slug + "-$1\"")
  content = content.replace(/#fnref(\d+)/g, "#fnref-" + slug + "-$1")
  content = content.replace(/id="fnref(\d+)"/g, "id=\"fnref-" + slug + "-$1\"")
  data.content = content
  return data
});