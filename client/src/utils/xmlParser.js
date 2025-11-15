/**
 * Parse Anchor XML to extract entities
 */

const parseXmlEntities = (xmlContent) => {
  const entities = {
    anchors: [],
    attributes: [],
    ties: [],
    nexus: [],
    knots: [],
  };

  if (!xmlContent) return entities;

  try {
    // Parse anchors
    const anchorMatches = xmlContent.match(/<Anchor[^>]*ID="([^"]*)"[^>]*>/g) || [];
    entities.anchors = anchorMatches.map((match) => {
      const idMatch = match.match(/ID="([^"]*)"/);
      const mneMatch = match.match(/Mne="([^"]*)"/);
      return {
        id: idMatch ? idMatch[1] : 'unknown',
        mne: mneMatch ? mneMatch[1] : 'unknown',
      };
    });

    // Parse attributes
    const attrMatches = xmlContent.match(/<Attribute[^>]*ID="([^"]*)"[^>]*>/g) || [];
    entities.attributes = attrMatches.map((match) => {
      const idMatch = match.match(/ID="([^"]*)"/);
      const mneMatch = match.match(/Mne="([^"]*)"/);
      const ancrMatch = match.match(/Ancr="([^"]*)"/);
      return {
        id: idMatch ? idMatch[1] : 'unknown',
        mne: mneMatch ? mneMatch[1] : 'unknown',
        anchor: ancrMatch ? ancrMatch[1] : 'unknown',
      };
    });

    // Parse ties
    const tieMatches = xmlContent.match(/<Tie[^>]*ID="([^"]*)"[^>]*>/g) || [];
    entities.ties = tieMatches.map((match) => {
      const idMatch = match.match(/ID="([^"]*)"/);
      const mneMatch = match.match(/Mne="([^"]*)"/);
      return {
        id: idMatch ? idMatch[1] : 'unknown',
        mne: mneMatch ? mneMatch[1] : 'unknown',
      };
    });

    // Parse nexus
    const nexusMatches = xmlContent.match(/<Nexus[^>]*ID="([^"]*)"[^>]*>/g) || [];
    entities.nexus = nexusMatches.map((match) => {
      const idMatch = match.match(/ID="([^"]*)"/);
      const mneMatch = match.match(/Mne="([^"]*)"/);
      return {
        id: idMatch ? idMatch[1] : 'unknown',
        mne: mneMatch ? mneMatch[1] : 'unknown',
      };
    });

    // Parse knots
    const knotMatches = xmlContent.match(/<Knot[^>]*ID="([^"]*)"[^>]*>/g) || [];
    entities.knots = knotMatches.map((match) => {
      const idMatch = match.match(/ID="([^"]*)"/);
      const mneMatch = match.match(/Mne="([^"]*)"/);
      return {
        id: idMatch ? idMatch[1] : 'unknown',
        mne: mneMatch ? mneMatch[1] : 'unknown',
      };
    });
  } catch (err) {
    console.error('Error parsing XML:', err);
  }

  return entities;
};

/**
 * Compare two entity lists and return added, removed, and modified
 */
const compareEntities = (entities1, entities2) => {
  const compareSets = (set1, set2, key = 'id') => {
    const ids1 = new Set(set1.map((item) => item[key]));
    const ids2 = new Set(set2.map((item) => item[key]));

    const added = set2.filter((item) => !ids1.has(item[key]));
    const removed = set1.filter((item) => !ids2.has(item[key]));
    const modified = set1.filter((item) => {
      const match2 = set2.find((i) => i[key] === item[key]);
      return match2 && JSON.stringify(item) !== JSON.stringify(match2);
    });

    return { added, removed, modified };
  };

  return {
    anchors: compareSets(entities1.anchors, entities2.anchors),
    attributes: compareSets(entities1.attributes, entities2.attributes),
    ties: compareSets(entities1.ties, entities2.ties),
    nexus: compareSets(entities1.nexus, entities2.nexus),
    knots: compareSets(entities1.knots, entities2.knots),
  };
};

export { parseXmlEntities, compareEntities };
