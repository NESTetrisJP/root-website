hexo.extend.tag.register("apng", function (args) {
  if (args[1] != null) {
    return `<img class="apng-controller-image" src="${hexo.config.root}images/apng/${args[0]}" data-apng-controller-group="${args[1]}"/>`
  } else {
    return `<img class="apng-controller-image" src="${hexo.config.root}images/apng/${args[0]}" />`
  }
}, false)

hexo.extend.tag.register("apng_group_controller", function (args) {
  return `<div class="apng-controller-group-controller" data-apng-controller-group="${args[0]}"></div>`
}, false)

hexo.extend.injector.register("body_end", `<script type="module">import { ApngController } from "${hexo.config.root}apng_controller/apng_controller.min.mjs";ApngController.initialize().transformAll()</script>`)
hexo.extend.injector.register("head_end", `<link rel="stylesheet" href="${hexo.config.root}apng_controller/additional_styles.css">`)