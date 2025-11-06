{
  "name": "StreamParticipant",
  "type": "object",
  "properties": {
    "stream_id": {
      "type": "string",
      "description": "Stream ID"
    },
    "user_id": {
      "type": "string",
      "description": "Participant user ID"
    },
    "user_name": {
      "type": "string",
      "description": "Participant name"
    },
    "username": {
      "type": "string",
      "description": "Participant username"
    },
    "user_avatar": {
      "type": "string",
      "description": "Participant avatar URL"
    },
    "user_created_date": {
      "type": "string",
      "format": "date-time",
      "description": "Participant account creation date (for OG badge)"
    },
    "position": {
      "type": "number",
      "description": "Position in the grid (0 for viewers, 1-14 for multi-troll participants)"
    },
    "is_host": {
      "type": "boolean",
      "default": false,
      "description": "Whether this user is the stream host"
    },
    "invited_by": {
      "type": "string",
      "description": "User ID of who invited them"
    },
    "status": {
      "type": "string",
      "enum": [
        "pending",
        "active",
        "removed"
      ],
      "default": "pending",
      "description": "Participant status"
    },
    "is_troll_officer": {
      "type": "boolean",
      "default": false,
      "description": "Whether this participant is a troll officer for this stream"
    },
    "is_muted": {
      "type": "boolean",
      "default": false,
      "description": "Whether this participant has muted their audio"
    },
    "muted_by": {
      "type": "string",
      "description": "User ID of who muted them (null if self-muted)"
    },
    "webrtc_answer": {
      "type": "string",
      "description": "WebRTC answer SDP from viewer (temporary solution)"
    },
    "last_heartbeat": {
      "type": "string",
      "format": "date-time",
      "description": "Last heartbeat timestamp to track active viewers"
    }
  },
  "required": [
    "stream_id",
    "user_id",
    "user_name"
  ]
}