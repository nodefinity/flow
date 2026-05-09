const empty = { items: [], hasNextPage: false, endCursor: undefined, totalCount: 0 }

export function getTracksAsync() {
  return Promise.resolve(empty)
}
export function getTrackMetadataAsync() {
  return Promise.resolve(null)
}
export function getTracksByAlbumAsync() {
  return Promise.resolve([])
}
export function getTracksByArtistAsync() {
  return Promise.resolve(empty)
}
export function getAlbumsAsync() {
  return Promise.resolve(empty)
}
export function getAlbumsByArtistAsync() {
  return Promise.resolve([])
}
export function getArtistsAsync() {
  return Promise.resolve(empty)
}

const MusicLibrary = {
  getTracksAsync,
  getTrackMetadataAsync,
  getTracksByAlbumAsync,
  getTracksByArtistAsync,
  getAlbumsAsync,
  getAlbumsByArtistAsync,
  getArtistsAsync,
}

export default MusicLibrary
