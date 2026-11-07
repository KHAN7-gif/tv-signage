import {youtubeId,coverImageUrl,driveImage} from './media-links.js?v=covers-2';
export function thumbnailUrl(item,kind){
 try{
  if(kind==='images')return driveImage(item.url);
  const cover=coverImageUrl(item.coverUrl);if(cover)return cover;
  const id=youtubeId(item.url);return id?`https://i.ytimg.com/vi/${id}/hqdefault.jpg`:'';
 }catch{return ''}
}
