/** Only self-hosted demos with verified open licenses belong in this catalog.
 * No complete matching set has been verified yet. Keep existing picture guides
 * until each clip's license, attribution and exact movement are checked.
 */
export const demoVideos = {};

const licenses = {
  'CC0-1.0': 'https://creativecommons.org/publicdomain/zero/1.0/',
  'CC-BY-4.0': 'https://creativecommons.org/licenses/by/4.0/',
  'CC-BY-SA-4.0': 'https://creativecommons.org/licenses/by-sa/4.0/',
};

export function approvedDemoVideo(video) {
  if (!video || !/^assets\/videos\/fitness\/[a-z0-9-]+\.mp4$/.test(video.src)
      || !video.publisher || !/^https:\/\//.test(video.sourceUrl)
      || !/^\d{4}-\d{2}-\d{2}$/.test(video.license?.verifiedOn || '')
      || !licenses[video.license?.id]
      || licenses[video.license.id] !== video.license.url) return null;
  return video;
}
