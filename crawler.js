import fetch from 'node-fetch'
import { JSDOM } from 'jsdom'
import { URL } from 'url'
import parseCssUrls from 'css-url-parser'

const address = new URL(process.argv[2])
const depth = Number(process.argv[3])
const assets = process.argv[4]=== '-a'
const visited = new Set(address.href)
const usage = `Usage: node crawler <url> <depth> < -a Optional, downloads assets as well as pages>`

const getUrl = (link, url) => {
  return link.startsWith('http') ? link : new URL(link, url).href
}

const getContents = async (url) => {
  try {
    const response = await fetch(url)
    const html = await response.text()
    return html
  } catch (error) {
    
  }
}

const getLinks = async (page, url) => {
  const linkArray = []
  const dom = new JSDOM(page)
  
  if(assets) {
    const scripts = Array.from(dom.window.document.scripts).filter(script=>script.src)
    scripts.forEach(script => linkArray.push(getUrl(script.src, url)))

    const styleSheets = dom.window.document.querySelectorAll('link')
    styleSheets.forEach(sheet=>{
      linkArray.push(getUrl(sheet.href, url))})
    
    if(page.includes('@import')){
      const cssImports = parseCssUrls(page)
      cssImports.forEach(cssImport =>{
        linkArray.push(getUrl(cssImport, url))
      })
    }
  }
  
  const links = dom.window.document.querySelectorAll('a')
  links.forEach(link=>{
    linkArray.push(getUrl(link.href, url))
  })
  return linkArray
}

const crawl = async (targetUrl, level) => {
  visited.add(targetUrl)
  level--
  const page = await getContents(targetUrl)
  console.log(targetUrl)
  console.log(`targetUrl: ${targetUrl}
    resource: 
${page || "No data"}
size: ${page?.length || "No data"}
  `)
  if(level > 0) {
    const links = await getLinks(page, targetUrl)
  links.forEach(link => {
    if(!visited.has(link)) crawl(link, level)
    })
  }
}
if(address && depth) {
  crawl(address.href, depth)
} else console.log(usage)
