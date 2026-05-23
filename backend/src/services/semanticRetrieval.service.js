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
    document.room,
    document.startTime,
    document.endTime,
    document.day,
  ]
    .filter(Boolean)
    .join(' ');

export const rankDocuments = (query, documents, { limit = 5, minScore = 0.12 } = {}) => {
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
    .filter((document) => document.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return ranked;
};

export const flattenAcademicContext = (context) => {
  const documents = [];

  context.timetable?.forEach((record) => {
    Object.entries(record.schedule || {}).forEach(([day, slots]) => {
      (slots || []).forEach((slot, index) => {
        const slotId = `${record.id || `${record.branch}-${record.semester}-${record.division}`}:${day}:${index}`;
        documents.push({
          collection: 'timetable',
          id: slotId,
          record: {
            ...slot,
            timetableId: record.id,
            branch: record.branch,
            semester: record.semester,
            division: record.division,
            day,
          },
          searchText: `${day} ${slot.startTime} ${slot.endTime} ${slot.subject} ${slot.facultyName} ${slot.room}`,
        });
      });
    });
  });

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

const titleFromRecord = (record = {}) =>
  record.title || record.displayName || record.subject || record.question || record.category || null;

export const toSemanticDocuments = (documents) =>
  documents.map((document) => ({
    id: document.id,
    collection: document.collection,
    text: document.searchText,
    title: titleFromRecord(document.record),
    metadata: {
      collection: document.collection,
      id: document.id,
    },
    record: document.record,
  }));

export default { rankDocuments, flattenAcademicContext, toSemanticDocuments };
