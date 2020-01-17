import LogicQueryParser from 'logic-query-parser';
// import * as platformTypes from './platformTypes';

function extractStringsFromParseTree(node) {
  let words = [];
  if (node.lexeme.type === 'string') {
    const str = node.lexeme.value.replace('*', ''); // remove any wildcards
    words = [str];
  } else {
    if (node.left) {
      words = words.concat(extractStringsFromParseTree(node.left));
    }
    if (node.right) {
      words = words.concat(extractStringsFromParseTree(node.right));
    }
  }
  return words;
}

// Extract keywords from a boolean logic search string
export function extractWordsFromQuery(searchString) {
  if (searchString) {
    const binaryTree = LogicQueryParser.parse(searchString);
    const strings = extractStringsFromParseTree(binaryTree);
    return strings.join(',');
  }
  return null;
}

const arrayOfStringsNotEmpty = (strings) => strings.map(s => (s ? s.trim() : '')).join().length > 0;

function searchTermsAsSolrQuery(matchType, matches, negations) {
  const conjuntion = (matchType === 'any') ? 'OR' : 'AND';
  const matchQuery = ((matches.length > 0) && arrayOfStringsNotEmpty(matches)) ? matches.join(` ${conjuntion} `) : '*';
  const negationsQuery = ((matches.length > 0) && arrayOfStringsNotEmpty(negations)) ? `AND NOT ${negations.join(' AND NOT ')}` : '';
  return `${matchQuery} ${negationsQuery}`;
}

export function searchTermsToQuery(platform, source, matchType, matches, negations) {
  if (platform && source) {
    switch (platform) {
      default:
        return searchTermsAsSolrQuery(matchType, matches, negations);
    }
  }
  return 'Sorry, we had a problem understanding your query 💣';
}
