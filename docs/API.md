# Real Estate CMS — REST API Documentation

## Base URLs

Production:
https://real-estate-cms-qtgi.onrender.com/api

Local:
http://localhost:5000/api

All requests and responses use JSON unless otherwise specified.

## Authentication

### Admin Login

POST /auth/login

Example request:

{
"email": "admin@example.com",
"password": "YOUR_ADMIN_PASSWORD"
}

A successful response includes an authentication token.

For protected endpoints, include:

Authorization: Bearer YOUR_JWT_TOKEN

### Get Current Admin

GET /auth/me

Requires authentication.

## CMS Resources

The following resource names are supported:

- projects
- sections
- amenities
- gallery
- floorPlans

### List Records

GET /cms/:type

Optional query parameters:

| Parameter | Description                       |
| --------- | --------------------------------- |
| page      | Page number                       |
| limit     | Number of records per page        |
| search    | Search term                       |
| status    | Draft/published filter for admins |
| projectId | Filter child resources by project |

Example:

GET /cms/amenities?projectId=1&page=1&limit=10

Public requests return published content only.

### Get a Record

GET /cms/:type/:id

Example:

GET /cms/projects/1

### Create a Record

POST /cms/:type

Requires admin authentication.

Example project request:

{
"name": "One Chembur",
"slug": "one-chembur",
"location": "Chembur, Mumbai",
"description": "Luxury residential development",
"heroImage": null,
"status": "draft",
"seoTitle": "One Chembur",
"seoDesc": "Luxury residences in Chembur"
}

### Update a Record

PATCH /cms/:type/:id

Requires admin authentication.

Example:

{
"status": "published"
}

### Delete a Record

DELETE /cms/:type/:id

Requires admin authentication.

## Content Sections

Example:

POST /cms/sections

{
"projectId": 1,
"title": "Seamless Connectivity",
"type": "connectivity",
"content": "Illustrative connectivity information",
"imageUrl": null,
"status": "published",
"order": 1
}

## Amenities

Example:

POST /cms/amenities

{
"projectId": 1,
"name": "Swimming Pool",
"icon": "waves",
"imageUrl": null,
"status": "published"
}

## Gallery

Example:

POST /cms/gallery

{
"projectId": 1,
"title": "Living Room",
"imageUrl": "https://example.com/living-room.jpg",
"category": "Interiors",
"status": "published"
}

## Floor Plans

Example:

POST /cms/floorPlans

{
"projectId": 1,
"name": "2 BHK",
"carpetArea": 750,
"totalArea": 1000,
"imageUrl": "https://example.com/floor-plan.jpg",
"pdfUrl": "https://example.com/floor-plan.pdf",
"status": "published"
}

Area values are illustrative examples.

## Customer Inquiries

### Submit Inquiry

POST /inquiries

Public endpoint.

Example:

{
"projectId": 1,
"name": "Test Customer",
"email": "customer@example.com",
"phone": "9876543210",
"message": "I would like to know more about the project."
}

### List Inquiries

GET /inquiries

Requires admin authentication.

### Update Inquiry

PATCH /inquiries/:id

Requires admin authentication.

Example:

{
"status": "contacted"
}

Supported inquiry statuses:

- new
- contacted
- closed

### Delete Inquiry

DELETE /inquiries/:id

Requires admin authentication.

## Activity Logs

GET /cms/activity-logs

Requires admin authentication.

Returns recent administrative activity records.

## HTTP Status Codes

| Code | Meaning                 |
| ---- | ----------------------- |
| 200  | Request successful      |
| 201  | Resource created        |
| 400  | Invalid request         |
| 401  | Authentication required |
| 404  | Resource not found      |
| 409  | Duplicate unique value  |
| 500  | Server error            |

## Security Notes

- Never expose JWT signing secrets.
- Do not include database credentials in requests.
- Use HTTPS in production.
- Admin CRUD endpoints must be protected by authentication middleware.
- Draft resources must not be exposed through public endpoints.

## Postman Testing

1. Import the supplied Postman collection.
2. Set the baseUrl collection variable.
3. Run the Admin Login request.
4. Copy the returned token into the token variable.
5. Test authenticated CMS endpoints.

This documentation describes the implemented API design. Verify exact request validation rules and response shapes against the current backend source before submission.
