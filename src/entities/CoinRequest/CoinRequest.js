{
  "name": "CoinRequest",
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "description": "User ID requesting coins"
    },
    "user_name": {
      "type": "string",
      "description": "Name of user"
    },
    "user_email": {
      "type": "string",
      "description": "Email of user"
    },
    "message": {
      "type": "string",
      "description": "User's request message"
    },
    "requested_amount": {
      "type": "number",
      "description": "Amount of coins requested"
    },
    "status": {
      "type": "string",
      "enum": [
        "pending",
        "approved",
        "rejected"
      ],
      "default": "pending",
      "description": "Request status"
    },
    "admin_response": {
      "type": "string",
      "description": "Admin's response message"
    },
    "approved_amount": {
      "type": "number",
      "description": "Amount approved by admin (may differ from requested)"
    },
    "coin_type": {
      "type": "string",
      "enum": [
        "free",
        "purchased"
      ],
      "description": "Type of coins approved"
    },
    "processed_by": {
      "type": "string",
      "description": "Admin who processed the request"
    },
    "processed_date": {
      "type": "string",
      "format": "date-time",
      "description": "When the request was processed"
    }
  },
  "required": [
    "user_id",
    "user_name",
    "message"
  ]
}