# Food Items API Documentation

## Base URL
All API endpoints are prefixed with `/api/foods`

## Endpoints

### GET /api/foods
Retrieve all food items with optional filtering

#### Query Parameters
- `category` (optional): Filter by food category (e.g., "fruit", "vegetable", "dairy", "grain", "protein", "pantry")
- `minExpiration` (optional): Filter items with expiration days greater than or equal to this value
- `maxExpiration` (optional): Filter items with expiration days less than or equal to this value

#### Response
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "string",
      "unit": "string",
      "category": "string",
      "typicalExpirationDays": "number",
      "sampleCostPerUnit": "number",
      "description": "string",
      "createdAt": "string",
      "updatedAt": "string"
    }
  ]
}
```

### GET /api/foods/:id
Retrieve a specific food item by ID

#### Response
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "unit": "string",
    "category": "string",
    "typicalExpirationDays": "number",
    "sampleCostPerUnit": "number",
    "description": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### POST /api/foods
Create a new food item

#### Request Body
```json
{
  "name": "string",
  "unit": "string",
  "category": "string",
  "typicalExpirationDays": "number",
  "sampleCostPerUnit": "number",
  "description": "string"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "unit": "string",
    "category": "string",
    "typicalExpirationDays": "number",
    "sampleCostPerUnit": "number",
    "description": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### PUT /api/foods/:id
Update an existing food item

#### Request Body
```json
{
  "name": "string",
  "unit": "string",
  "category": "string",
  "typicalExpirationDays": "number",
  "sampleCostPerUnit": "number",
  "description": "string"
}
```

#### Response
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "unit": "string",
    "category": "string",
    "typicalExpirationDays": "number",
    "sampleCostPerUnit": "number",
    "description": "string",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

### DELETE /api/foods/:id
Delete a food item (soft delete)

#### Response
```json
{
  "success": true,
  "message": "Food item deleted successfully"
}
```

## Example Usage

### Get all fruit items
```
GET /api/foods?category=fruit
```

### Get items expiring within 7 days
```
GET /api/foods?maxExpiration=7
```

### Get items with expiration between 5-10 days
```
GET /api/foods?minExpiration=5&maxExpiration=10
```