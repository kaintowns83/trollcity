{
  "name": "ChatFlag",
  "type": "object",
  "properties": {
    "message_id": {
      "type": "string",
      "description": "Flagged message ID"
    },
    "stream_id": {
      "type": "string",
      "description": "Stream ID where message was sent"
    },
    "user_id": {
      "type": "string",
      "description": "User who sent the message"
    },
    "username": {
      "type": "string",
      "description": "Username"
    },
    "message_content": {
      "type": "string",
      "description": "The flagged message content"
    },
    "matched_keywords": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Keywords that triggered the flag"
    },
    "ai_analysis": {
      "type": "string",
      "description": "AI analysis of the message"
    },
    "ai_confidence": {
      "type": "number",
      "description": "AI confidence score (0-100)"
    },
    "flag_type": {
      "type": "string",
      "enum": [
        "explicit",
        "harassment",
        "hate_speech",
        "underage",
        "spam",
        "threats",
        "other"
      ],
      "default": "explicit",
      "description": "Type of flag"
    },
    "severity": {
      "type": "string",
      "enum": [
        "low",
        "medium",
        "high",
        "critical"
      ],
      "default": "medium",
      "description": "Severity level"
    },
    "auto_action_taken": {
      "type": "string",
      "enum": [
        "none",
        "hidden",
        "muted",
        "banned"
      ],
      "description": "Automatic action taken by AI"
    },
    "status": {
      "type": "string",
      "enum": [
        "pending",
        "reviewed",
        "dismissed",
        "action_taken"
      ],
      "default": "pending",
      "description": "Review status"
    },
    "reviewed_by": {
      "type": "string",
      "description": "Troll Officer/Admin who reviewed"
    },
    "review_notes": {
      "type": "string",
      "description": "Notes from review"
    },
    "action_taken": {
      "type": "string",
      "description": "Action taken (ban, warning, etc)"
    }
  },
  "required": [
    "message_id",
    "stream_id",
    "user_id",
    "message_content"
  ]
}