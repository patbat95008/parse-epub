import items from './items';
import uniqueId from 'lodash/utility/uniqueId';

const ATTRIBUTES = {
  id: 'idref',
  href: 'href'
};
const TAG = 'nav[id="toc"]';
export const ROOT = '__root__';

export default function toc(tocHtml, manifest, spine) {
  const byId = {};
  const byManifestId = {};
  const items = [];

  parse(tocHtml.querySelector(TAG), ROOT);

  function parse(snippet, id, href, label, parentId) {
    const hrefWithoutHash = href && href.split('#')[0];
    const manifestId = Object.keys(manifest.byId).find(id => manifest.byId[id].href === hrefWithoutHash);

    // Only process linear nodes
    if (id === ROOT || spine.byId[manifestId].linear) {
      const ol = snippet.querySelector('ol');
      let childNodes = [];

      if (ol) {
        childNodes = Array.prototype.filter.call(ol.children, node => node.tagName === 'LI')
          .map(node => {
            const link = node.querySelector('a');
            const childId = uniqueId();
            return parse(node, childId, link.getAttribute('href'), link.textContent, id) && childId;
          })
          .filter(id => id);
      }

      const isLeaf = childNodes.length === 0;

      // We mainly care about leafs as those are the ones that contain pages and are thus open
      if (isLeaf) {
        byManifestId[manifestId] = id;
        items.push(id);
      }

      byId[id] = {
        childNodes,
        id,
        isLeaf,
        href,
        label,
        manifestId,
        parentId
      };

      return true;
    } else {
      return false;
    }
  }

  return {
    byId,
    byManifestId,
    items
  };
}

// TODO
// - page-progression-direction
//   https://github.com/dariocravero/readium-js/blob/master/src/epub/package-document-parser.js#L68