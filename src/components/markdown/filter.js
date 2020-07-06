import xss from 'xss'

export default function(html) {
  return xss(html, {
    whiteList: {
      a: ['class', 'style', 'id', 'target', 'href', 'title', 'rel'],
      abbr: ['class', 'title'],
      address: ['class'],
      area: ['class', 'shape', 'coords', 'href', 'alt'],
      article: ['class'],
      aside: ['class'],
      audio: ['class', 'autoplay', 'controls', 'loop', 'preload', 'src'],
      b: ['class', 'style'],
      bdi: ['class', 'dir'],
      bdo: ['class', 'dir'],
      big: ['class'],
      blockquote: ['class', 'cite'],
      br: ['class'],
      caption: ['class'],
      center: ['class'],
      cite: ['class'],
      code: ['class'],
      col: ['class', 'align', 'valign', 'span', 'width'],
      colgroup: ['class', 'align', 'valign', 'span', 'width'],
      dd: ['class'],
      del: ['class', 'datetime'],
      details: ['class', 'open'],
      div: ['class'],
      dl: ['class'],
      dt: ['class'],
      em: ['class'],
      font: ['class', 'color', 'size', 'face'],
      footer: ['class'],
      h1: ['class'],
      h2: ['class'],
      h3: ['class'],
      h4: ['class'],
      h5: ['class'],
      h6: ['class'],
      header: ['class'],
      hr: ['class'],
      i: ['class'],
      img: ['class', 'src', 'alt', 'title', 'width', 'max-width', 'style', 'height'],
      ins: ['class', 'datetime'],
      li: ['class'],
      mark: ['class'],
      nav: ['class'],
      ol: ['class'],
      p: ['class'],
      pre: ['class'],
      s: ['class'],
      section: ['class'],
      small: ['class'],
      span: ['class'],
      sub: ['class'],
      summary: ['class'],
      sup: ['class'],
      strong: ['class'],
      table: ['class', 'width', 'border', 'align', 'valign'],
      tbody: ['class', 'align', 'valign'],
      td: ['class', 'width', 'rowspan', 'colspan', 'align', 'valign'],
      tfoot: ['class', 'align', 'valign'],
      th: ['class', 'width', 'rowspan', 'colspan', 'align', 'valign'],
      thead: ['class', 'align', 'valign'],
      tr: ['class', 'rowspan', 'align', 'valign'],
      tt: ['class'],
      u: ['class'],
      ul: ['class'],
      video: ['class', 'autoplay', 'controls', 'loop', 'preload', 'src', 'height', 'width'],
      input: ['class', 'type', 'src', 'disabled', 'checked'],
      math: ['class'],
      annotation: ['class', 'encoding']
    },
    onTagAttr: function(tag, name, value, isWhiteAttr) {
      if (tag === 'a' && name === 'href') {
        return `href='${xss.friendlyAttrValue(value)}'`
      }
    }
  })
}
