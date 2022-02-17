import fetch from 'node-fetch'
import { JSDOM } from 'jsdom'
import { URL } from 'url'

const address = new URL(process.argv[2])
const depth = process.argv[3]
const assets = process.argv[4]=== '-a'
const visited = new Set(address.href)
const usage = `Usage: node crawler <url> <depth> < -a Optional, downloads assets as well as pages>`

const getUrl = (link, url) => {
  return link.startsWith('http') ? link : new URL(link, url)
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
  }
  
  const links = dom.window.document.querySelectorAll('a')
  links.forEach(link=>{
    linkArray.push(getUrl(link.href, url))
  })
  return linkArray
}

const crawl = async (url, depth) => {
  visited.add(url)
  depth--
  const page = await getContents(url)
  console.log(`url: ${url}
    resource: ${page || "No data"}
    size: ${page?.length || "No data"}
  `)
  const links = await getLinks(page, url)
  links.forEach(link => {
    if(!visited.has(link) && depth > 0) crawl(link, depth)
  }) 
}
if(address && depth) {
  crawl(address, depth)
} else console.log(usage)
