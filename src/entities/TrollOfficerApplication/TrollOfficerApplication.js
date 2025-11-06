{
  "name": "TrollOfficerApplication",
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "description": "User ID applying"
    },
    "user_name": {
      "type": "string",
      "description": "User name"
    },
    "user_email": {
      "type": "string",
      "description": "User email"
    },
    "username": {
      "type": "string",
      "description": "Username"
    },
    "user_level": {
      "type": "number",
      "description": "User level at time of application"
    },
    "total_streaming_hours": {
      "type": "number",
      "description": "Streaming hours at time of application"
    },
    "reason": {
      "type": "string",
      "description": "Why they want to be a troll officer"
    },
    "experience": {
      "type": "string",
      "description": "Previous moderation experience"
    },
    "availability": {
      "type": "string",
      "description": "How many hours per week they can moderate"
    },
    "status": {
      "type": "string",
      "enum": [
        "pending",
        "approved",
        "rejected"
      ],
      "default": "pending",
      "description": "Application status"
    },
    "total_votes": {
      "type": "number",
      "default": 0,
      "description": "Total votes received"
    },
    "approve_votes": {
      "type": "number",
      "default": 0,
      "description": "Number of approve votes"
    },
    "reject_votes": {
      "type": "number",
      "default": 0,
      "description": "Number of reject votes"
    },
    "required_votes": {
      "type": "number",
      "description": "Number of votes needed for decision"
    },
    "approved_by": {
      "type": "string",
      "description": "Admin/officer who cast final vote"
    },
    "approved_date": {
      "type": "string",
      "format": "date-time",
      "description": "When application was processed"
    },
    "rejection_reason": {
      "type": "string",
      "description": "Reason for rejection"
    }
  },
  "required": [
    "user_id",
    "user_name",
    "reason"
  ]
}