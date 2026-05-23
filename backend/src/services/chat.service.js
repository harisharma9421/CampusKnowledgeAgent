import * as academicService from './academic.service.js';
import * as aiClient from './aiClient.service.js';
import {
  flattenAcademicContext,
  rankDocuments,
  toSemanticDocuments,
} from './semanticRetrieval.service.js';

const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const truncate = (text, maxLength = 160) => {
  const value = String(text || '').trim();
  if (value.length <= maxLength) {
    return value;
  }
  return `${value.slice(0, maxLength - 3)}...`;
};

const getRequestedDay = (query) => {
  const normalized = query.toLowerCase();
  const explicitDay = dayNames.find((day) => normalized.includes(day));
  if (explicitDay) {
    return explicitDay;
  }
  if (normalized.includes('tomorrow')) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return academicService.getDayNameFromDate(tomorrow);
  }
  return academicService.getDayNameFromDate();
};

const firstItems = (items, count = 3) => items.slice(0, count);

const formatDate = (value) => {
  if (!value) {
    return 'date not specified';
  }
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const buildTimetableResponse = (context, query) => {
  const day = getRequestedDay(query);
  if (day === 'sunday') {
    return 'There are no regular timetable slots on Sunday in the ERP timetable.';
  }

  const timetable = context.timetable?.[0];
  const slots = timetable?.schedule?.[day] || [];

  if (!timetable || slots.length === 0) {
    return `I could not find an active ${day} timetable for your current academic profile.`;
  }

  const firstSlot = slots[0];
  const slotSummary = firstItems(slots, 4)
    .map((slot) => `${slot.startTime}-${slot.endTime}: ${slot.subject} with ${slot.facultyName} in ${slot.room}`)
    .join('; ');

  return `Your first lecture on ${day} is ${firstSlot.subject} at ${firstSlot.startTime} in ${firstSlot.room}. Today's visible slots are: ${slotSummary}.`;
};

const buildNoticeResponse = (records) => {
  if (!records.length) {
    return 'I could not find any active notices matching your academic profile.';
  }

  const summary = firstItems(records)
    .map((notice) => `${notice.title}: ${truncate(notice.content, 120)}`)
    .join(' ');
  return `Here are the most relevant notices I found: ${summary}`;
};

const buildEventResponse = (records) => {
  if (!records.length) {
    return 'I could not find any upcoming events matching your academic profile.';
  }

  const summary = firstItems(records)
    .map((event) => `${event.title} on ${formatDate(event.eventDate)} at ${event.venue}`)
    .join('; ');
  return `Upcoming relevant events: ${summary}.`;
};

const buildFacultyResponse = (records) => {
  if (!records.length) {
    return 'I could not find matching faculty records for your query.';
  }

  const summary = firstItems(records)
    .map((faculty) => {
      const subjects = (faculty.subjects || []).slice(0, 2).join(', ');
      return `${faculty.displayName}, ${faculty.designation}, ${subjects}, office ${faculty.office}`;
    })
    .join('; ');
  return `Faculty records I found: ${summary}.`;
};

const buildFaqResponse = (records) => {
  if (!records.length) {
    return 'I could not find a matching FAQ entry in the academic knowledge base.';
  }

  const faq = records[0];
  return `${faq.question} ${faq.answer}`;
};

const buildScheduleUpdateResponse = (records) => {
  if (!records.length) {
    return 'I could not find schedule update notifications for your academic profile.';
  }

  const summary = firstItems(records)
    .map((notification) => `${notification.title}: ${truncate(notification.message, 120)}`)
    .join(' ');
  return `Schedule-related updates: ${summary}`;
};

const collectIntentContext = async (intent, query, user) => {
  const day = getRequestedDay(query);

  if (intent === 'timetable_query') {
    const timetable = await academicService.getTimetable({
      page: 1,
      limit: 3,
      day: day === 'sunday' ? undefined : day,
    }, user);
    return { timetable: timetable.data, notices: [], events: [], faculty: [], faq: [], notifications: [] };
  }

  if (intent === 'notice_query') {
    const notices = await academicService.getNotices({ page: 1, limit: 20 }, user);
    return { timetable: [], notices: notices.data, events: [], faculty: [], faq: [], notifications: [] };
  }

  if (intent === 'event_query') {
    const events = await academicService.getEvents({ page: 1, limit: 20, upcoming: true }, user);
    return { timetable: [], notices: [], events: events.data, faculty: [], faq: [], notifications: [] };
  }

  if (intent === 'faculty_query') {
    const faculty = await academicService.getFaculty({ page: 1, limit: 20 }, user);
    return { timetable: [], notices: [], events: [], faculty: faculty.data, faq: [], notifications: [] };
  }

  if (intent === 'schedule_update') {
    const notifications = await academicService.getNotifications({
      page: 1,
      limit: 20,
      type: 'schedule_update',
    }, user);
    return { timetable: [], notices: [], events: [], faculty: [], faq: [], notifications: notifications.data };
  }

  const faq = await academicService.getFaq({ page: 1, limit: 20 }, user);
  return { timetable: [], notices: [], events: [], faculty: [], faq: faq.data, notifications: [] };
};

const recordsFromRanked = (ranked, fallbackRecords) => {
  if (!ranked.length) {
    return fallbackRecords;
  }
  return ranked.map((item) => item.record);
};

const rankedFromAiResults = (results) =>
  (results || []).map((result) => ({
    collection: result.collection,
    id: result.id,
    score: result.score,
    record: result.record,
    searchText: result.text,
  }));

const buildDraftResponse = (intent, query, context, rankedDocuments) => {
  if (intent === 'timetable_query') {
    return buildTimetableResponse(context, query);
  }

  if (intent === 'notice_query') {
    return buildNoticeResponse(recordsFromRanked(rankedDocuments, context.notices));
  }

  if (intent === 'event_query') {
    return buildEventResponse(recordsFromRanked(rankedDocuments, context.events));
  }

  if (intent === 'faculty_query') {
    return buildFacultyResponse(recordsFromRanked(rankedDocuments, context.faculty));
  }

  if (intent === 'schedule_update') {
    return buildScheduleUpdateResponse(recordsFromRanked(rankedDocuments, context.notifications));
  }

  return buildFaqResponse(recordsFromRanked(rankedDocuments, context.faq));
};

const shouldUseGeminiResponse = (geminiResult, draftResponse) => {
  if (!geminiResult?.response || geminiResult.status !== 'ok') {
    return false;
  }
  return geminiResult.response.length <= Math.max(500, draftResponse.length * 2.5);
};

export const processChatQuery = async ({ query, user }) => {
  const startedAt = Date.now();
  const intentResult = await aiClient.classifyIntent(query, user);
  const context = await collectIntentContext(intentResult.intent, query, user);
  const documents = flattenAcademicContext(context);
  const aiDocuments = toSemanticDocuments(documents);
  const aiSemanticResult = documents.length
    ? await aiClient.semanticSearch({
        query,
        topK: 5,
        documents: aiDocuments,
        namespace: `chat:${user.id}:${intentResult.intent}`,
      })
    : {
        results: [],
        diagnostics: { documentCount: 0 },
        provider: 'ai_engine',
        status: 'skipped',
      };
  const rankedDocuments =
    aiSemanticResult.status === 'ok' && aiSemanticResult.results.length
      ? rankedFromAiResults(aiSemanticResult.results)
      : rankDocuments(query, documents, { limit: 5 });
  const draftResponse = buildDraftResponse(intentResult.intent, query, context, rankedDocuments);
  const geminiResult = await aiClient.enhanceWithGemini({
    query,
    intent: intentResult.intent,
    draftResponse,
    context: {
      rankedDocuments: rankedDocuments.map(({ collection, id, score }) => ({ collection, id, score })),
      records: rankedDocuments.map((item) => item.record),
    },
  });
  const finalResponse = shouldUseGeminiResponse(geminiResult, draftResponse)
    ? geminiResult.response
    : draftResponse;

  return {
    success: true,
    query,
    intent: intentResult.intent,
    confidence: Number(intentResult.confidence.toFixed(2)),
    response: finalResponse,
    metadata: {
      source:
        geminiResult.status === 'ok'
          ? 'Firestore + Gemini enhancement'
          : 'Firestore + backend formatter',
      processing_time_ms: Date.now() - startedAt,
      ai_service: {
        intent: intentResult.status,
        semantic_search: aiSemanticResult.status,
        gemini: geminiResult.status,
      },
      retrieval: {
        candidate_count: documents.length,
        ranked_count: rankedDocuments.length,
        semantic_matches: aiSemanticResult.results?.length || 0,
        semantic_threshold: aiSemanticResult.diagnostics?.threshold,
        embedding_dimension: aiSemanticResult.diagnostics?.embeddingDimension,
      },
    },
  };
};

export default { processChatQuery };
