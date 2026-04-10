export const urlJoin = (baseUrl: string, url: string) => {
    const uri = new URL(url, baseUrl)
    return uri.href
}