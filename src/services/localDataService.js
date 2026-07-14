export async function loadAttractions() {
  const response = await fetch('/data/attractions.json')

  if (!response.ok) {
    throw new Error('관광지 데이터를 불러오는 중 오류가 발생했습니다.')
  }

  const data = await response.json()

  if (!Array.isArray(data.items)) {
    throw new Error('관광지 목록이 올바른 형식이 아닙니다.')
  }

  const items = data.items.map((item) => {
    const addressParts = [item.addr1, item.addr2].filter(Boolean)
    const rawImage = item.firstimage || ''
    const image = rawImage.startsWith('http://')
      ? rawImage.replace(/^http:\/\//, 'https://')
      : rawImage

    return {
      id: item.contentid,
      title: item.title,
      category: data.contentType,
      address: addressParts.join(' '),
      image: image || '',
      latitude: Number(item.mapy),
      longitude: Number(item.mapx),
      telephone: item.tel,
      zipcode: item.zipcode,
      copyrightType: item.cpyrhtDivCd
    }
  })

  return {
    items,
    total: Number(data.total ?? items.length)
  }
}