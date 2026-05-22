const tokenize = (text) =>
  String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 2);

const unique = (items) => [...new Set(items)];

const buildSearchText = (document) =>
  [
    document.title,
    document.content,
    document.description,
    document.question,
    document.answer,
    document.displayName,
    document.department,
    document.designation,
    document.subject,
    document.subjects?.join(' '),
    document.category,
  ]
    .filter(Boolean)
    .join(' ');

export const rankDocuments = (query, documents, { limit = 5 } = {}) => {
  const queryTokens = unique(tokenize(query));
  const phrase = String(query || '').trim().toLowerCase();

  const ranked = documents
    .map((document) => {
      const searchText = document.searchText || buildSearchText(document.record || document);
      const haystack = searchText.toLowerCase();
      const documentTokens = new Set(tokenize(searchText));
      const overlap = queryTokens.filter((token) => documentTokens.has(token)).length;
      const phraseBoost = phrase && haystack.includes(phrase) ? 2 : 0;
      const score = queryTokens.length ? (overlap + phraseBoost) / (queryTokens.length + 2) : 0;

      return {
        ...document,
        score: Number(score.toFixed(4)),
      };
    })
    .filter((document) => document.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return ranked;
};

export const flattenAcademicContext = (context) => {
  const documents = [];

  context.notices?.forEach((record) => {
    documents.push({
      collection: 'notices',
      id: record.id,
      record,
      searchText: `${record.title} ${record.content} ${record.category}`,
    });
  });

  context.events?.forEach((record) => {
    documents.push({
      collection: 'events',
      id: record.id,
      record,
      searchText: `${record.title} ${record.description} ${record.venue} ${record.category}`,
    });
  });

  context.faculty?.forEach((record) => {
    documents.push({
      collection: 'faculty',
      id: record.id,
      record,
      searchText: `${record.displayName} ${record.department} ${record.designation} ${(record.subjects || []).join(
        ' '
      )}`,
    });
  });

  context.faq?.forEach((record) => {
    documents.push({
      collection: 'faq',
      id: record.id,
      record,
      searchText: `${record.question} ${record.answer} ${record.category} ${(record.tags || []).join(' ')}`,
    });
  });

  context.notifications?.forEach((record) => {
    documents.push({
      collection: 'notifications',
      id: record.id,
      record,
      searchText: `${record.title} ${record.message} ${record.type}`,
    });
  });

  return documents;
};

export default { rankDocuments, flattenAcademicContext };
