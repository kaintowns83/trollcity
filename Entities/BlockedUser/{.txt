{
  "name": "BlockedUser",
  "type": "object",
  "properties": {
    "blocker_id": {
      "type": "string",
      "description": "User ID who blocked"
    },
    "blocker_name": {
      "type": "string",
      "description": "Name of blocker"
    },
    "blocked_id": {
      "type": "string",
      "description": "User ID being blocked"
    },
    "blocked_name": {
      "type": "string",
      "description": "Name of blocked user"
    },
    "blocked_username": {
      "type": "string",
      "description": "Username of blocked user"
    },
    "reason": {
      "type": "string",
      "description": "Reason for blocking"
    }
  },
  "required": [
    "blocker_id",
    "blocked_id"
  ]
}