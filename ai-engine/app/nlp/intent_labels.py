"""Intent label definitions shared by training and inference."""

INTENT_LABELS = [
    "timetable_query",
    "notice_query",
    "event_query",
    "faq_query",
    "faculty_query",
    "schedule_update",
]

LABEL_TO_ID = {label: index for index, label in enumerate(INTENT_LABELS)}
ID_TO_LABEL = {index: label for label, index in LABEL_TO_ID.items()}

