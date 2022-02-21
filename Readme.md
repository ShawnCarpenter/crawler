## Installation

```
git clone https://github.com/ShawnCarpenter/crawler.git

cd crawler
npm i
```

## Basic Usage

```
node crawler url number_of_levels [-a]
```

I am using the following packages:

- node-fetch to fetch the data
- jsdom package to parse the returned data for links
- css-url-parser to get the @import links from the .css files
