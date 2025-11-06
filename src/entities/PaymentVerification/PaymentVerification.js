{
  "name": "PaymentVerification",
  "type": "object",
  "properties": {
    "user_id": {
      "type": "string",
      "description": "User ID"
    },
    "user_name": {
      "type": "string",
      "description": "User name"
    },
    "user_email": {
      "type": "string",
      "description": "User email"
    },
    "payment_method": {
      "type": "string",
      "description": "Payment method being verified"
    },
    "payment_details": {
      "type": "string",
      "description": "Payment account details"
    },
    "test_payment_sent": {
      "type": "boolean",
      "default": false,
      "description": "Whether $0.00 test payment was sent"
    },
    "test_payment_date": {
      "type": "string",
      "format": "date-time",
      "description": "When test payment was sent"
    },
    "verified_by_user": {
      "type": "boolean",
      "default": false,
      "description": "User confirmed they received test payment"
    },
    "verified_date": {
      "type": "string",
      "format": "date-time",
      "description": "When user verified receipt"
    },
    "verification_required": {
      "type": "boolean",
      "default": true,
      "description": "User must verify before next payout"
    },
    "transaction_id": {
      "type": "string",
      "description": "Test payment transaction ID"
    },
    "notes": {
      "type": "string",
      "description": "Admin notes"
    }
  },
  "required": [
    "user_id",
    "payment_method"
  ]
}