const urlMap = {
  'deezer.com': ['music'],
  'youtube.com': ['video'],
  'index.hr/sport': ['news', 'sport'],
  'index.hr': ['news'],
  '24sata.hr': ['news'],
  'vecernji.hr': ['news'],
  'net.hr': ['news'],
  'jutarnji.hr': ['news'],
  'telegram.hr': ['news'],
  '9gag.com': ['meme']
}

function commonConditions(url, check) {
  return (
    url.startsWith(`http://${check}`) ||
    url.startsWith(`http://www.${check}`) ||
    url.startsWith(`https://${check}`) ||
    url.startsWith(`https://www.${check}`)
  )
}

export function defaultTags(url) {
  for (const domain of Object.keys(urlMap)) {
    if (commonConditions(url, domain)) {
      return urlMap[domain]
    }
  }
  return []
}
