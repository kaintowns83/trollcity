{
  "name": "PostComment",
  "type": "object",
  "properties": {
    "post_id": {
      "type": "string",
      "description": "Post ID"
    },
    "user_id": {
      "type": "string",
      "description": "Commenter user ID"
    },
    "user_name": {
      "type": "string",
      "description": "Commenter name"
    },
    "username": {
      "type": "string",
      "description": "Commenter username"
    },
    "user_avatar": {
      "type": "string",
      "description": "Commenter avatar"
    },
    "comment": {
      "type": "string",
      "description": "Comment text"
    },
    "likes_count": {
      "type": "number",
      "default": 0,
      "description": "Number of likes on this comment"
    }
  },
  "required": [
    "post_id",
    "user_id",
    "comment"
  ]
}