{
  "name": "TrollOfficerVote",
  "type": "object",
  "properties": {
    "application_id": {
      "type": "string",
      "description": "Troll Officer Application ID"
    },
    "voter_id": {
      "type": "string",
      "description": "User ID of the voter (admin or troll officer)"
    },
    "voter_name": {
      "type": "string",
      "description": "Name of the voter"
    },
    "vote": {
      "type": "string",
      "enum": [
        "approve",
        "reject"
      ],
      "description": "Vote decision"
    },
    "comment": {
      "type": "string",
      "description": "Optional comment/reason for vote"
    }
  },
  "required": [
    "application_id",
    "voter_id",
    "vote"
  ]
}