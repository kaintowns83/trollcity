{
  "name": "BroadcasterApplication",
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
    "id_document_url": {
      "type": "string",
      "description": "Uploaded ID document URL"
    },
    "id_type": {
      "type": "string",
      "enum": [
        "passport",
        "drivers_license",
        "national_id"
      ],
      "description": "Type of ID document"
    },
    "id_number": {
      "type": "string",
      "description": "ID number"
    },
    "id_expiry_date": {
      "type": "string",
      "format": "date",
      "description": "ID expiration date"
    },
    "is_expired": {
      "type": "boolean",
      "default": false,
      "description": "Whether ID is expired"
    },
    "ai_verification_result": {
      "type": "string",
      "description": "AI verification result"
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
    "approved_by": {
      "type": "string",
      "description": "Admin who approved"
    },
    "approved_date": {
      "type": "string",
      "format": "date-time",
      "description": "When approved"
    },
    "rejection_reason": {
      "type": "string",
      "description": "Reason for rejection"
    }
  },
  "required": [
    "user_id",
    "id_document_url",
    "id_type"
  ]
}