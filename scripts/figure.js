hexo.extend.tag.register("apng", (args) => {
  return `<img class="apng-images" src=/images/apng/${args[0]}" />`
}, false)

