/** CC0 model and baked motion; provenance in docs/fitness-video-sources.md. */
export const demoModels = {
  'push-up': {
    src: 'assets/models/fitness/push-up.glb',
    publisher: 'OpenGym3D · MakeHuman · Mesh2Motion',
    sourceUrl: 'https://github.com/AssiamahS/opengym3d',
    license: { id: 'CC0-1.0', url: 'https://creativecommons.org/publicdomain/zero/1.0/', verifiedOn: '2026-10-19' },
    animation: 'Human.rig',
  },
};

export function approvedDemoModel(model) {
  if (!model || !/^assets\/models\/fitness\/[a-z0-9-]+\.glb$/.test(model.src)
      || !model.publisher || !/^https:\/\//.test(model.sourceUrl)
      || model.license?.id !== 'CC0-1.0'
      || model.license.url !== 'https://creativecommons.org/publicdomain/zero/1.0/'
      || !/^\d{4}-\d{2}-\d{2}$/.test(model.license.verifiedOn || '')) return null;
  return model;
}
