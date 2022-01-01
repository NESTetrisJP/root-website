hexo.extend.tag.register("apng", function (args) {
  return `<img class="apng-images" src="${hexo.config.root}images/apng/${args[0]}" />`
}, false)

