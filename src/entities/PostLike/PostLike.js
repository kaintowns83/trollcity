{
  "name": "PostLike",
  "type": "object",
  "properties": {
    "post_id": {
      "type": "string",
      "description": "Post ID"
    },
    "user_id": {
      "type": "string",
      "description": "User who liked"
    },
    "user_name": {
      "type": "string",
      "description": "User name"
    }
  },
  "required": [
    "post_id",
    "user_id"
  ]
}