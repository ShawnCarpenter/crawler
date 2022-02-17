import fetch from 'node-fetch'
import { JSDOM } from 'jsdom'

const address = process.argv[2]
const depth = process.argv[3]
const assets = process.argv[4]=== '-a'
const visited = new Set(address)
const usage = `Usage: node crawler <url> <depth> < -a Optional, downloads assets as well as pages>`
const getUrl = link => {
  return link.startsWith('http') ? link : address + link
}

const getContents = async (addr) => {
  try {
    const response = await fetch(addr)
    const html = await response.text()
    return html
  } catch (error) {
    
  }
}

const getLinks = (page, url) => {
  const linkArray = []
  const dom = new JSDOM(page, {
    url: url,
    resources: "usable",
    pretendToBeVisual: true})
  
  if(assets) {
    const scripts = Array.from(dom.window.document.scripts).filter(script=>script.src)
    scripts.forEach(script => linkArray.push(getUrl(script.src)))
   
    const styleSheets = dom.window.document.querySelectorAll('link')
    styleSheets.forEach(sheet=>{
      linkArray.push(getUrl(sheet.href))})
  }
  
  const links = dom.window.document.querySelectorAll('a')
  links.forEach(link=>{
    linkArray.push(getUrl(link.href))
  })
  return linkArray
}

const crawl = async (url, depth) => {
  visited.add(url)
  depth--
  const page = await getContents(url)
  console.log(`url: ${url}
  resource: ${page}
  size: ${page.length}
  `)
  const links = getLinks(page, url)
  links.forEach(link => {
    if(!visited.has(link) && depth > 0) crawl(link, depth)
  }) 
}
if(address && depth) {
  crawl(address, depth)
} else console.log(usage)
