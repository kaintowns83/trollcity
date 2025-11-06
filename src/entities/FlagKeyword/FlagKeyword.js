{
  "name": "FlagKeyword",
  "type": "object",
  "properties": {
    "keyword": {
      "type": "string",
      "description": "Keyword or phrase to flag"
    },
    "flag_type": {
      "type": "string",
      "enum": [
        "underage",
        "inappropriate",
        "harassment",
        "spam",
        "other"
      ],
      "default": "inappropriate",
      "description": "Type of content this keyword relates to"
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
    "is_active": {
      "type": "boolean",
      "default": true,
      "description": "Whether this keyword is currently being monitored"
    },
    "added_by": {
      "type": "string",
      "description": "Admin who added this keyword"
    },
    "description": {
      "type": "string",
      "description": "Why this keyword is flagged"
    }
  },
  "required": [
    "keyword",
    "flag_type"
  ]
}