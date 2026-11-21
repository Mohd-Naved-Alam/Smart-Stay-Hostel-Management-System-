# Smart Stay - Hostel Management System

Smart Stay is a hostel administration app with a React dashboard and an Express API backed by MongoDB. It supports student and room records, room-allocation endpoints, mess menus, out-of-hostel requests, and visitor records.

## Features

- Manage student profiles and hostel rooms.
- View room capacity and occupancy.
- Allocate and deallocate rooms through the API.
- Maintain mess menu entries.
- Review day-out and night-out requests.
- Record visitor check-ins.

## Project layout

```text
HMS/
  backend/   Express API and Mongoose models
  frontend/  React dashboard
```

## Requirements

- Node.js and npm
- MongoDB, either local or hosted

## Run locally

### 1. Start the backend

In `HMS/backend`, install dependencies:

```sh
npm install
```

Create `HMS/backend/.env` with your MongoDB connection string:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/smart-stay
PORT=5000
```

`MONGODB_URI` is required. `PORT` is optional and defaults to `5000`.

Start the API:

```sh
npm start
```

The API base URL is `http://localhost:5000/api`. The root health/info endpoint is `http://localhost:5000/`.

### 2. Start the frontend

In a second terminal, install and start the React app:

```sh
cd HMS/frontend
npm install
npm start
```

The frontend opens at `http://localhost:3000`. Its API URL is currently set to `http://localhost:5000/api` in `src/App.js`; update that value when using a different backend URL.

## Room allotment

Room allotment is implemented by the backend at `/api/allocations`.

1. Create or find a student and a room. Use their MongoDB `_id` values.
2. Check current allocations with `GET /api/allocations`.
3. Allocate a room with `POST /api/allocations`, supplying `studentId` and `roomId`:

   ```sh
   curl -X POST http://localhost:5000/api/allocations \
     -H "Content-Type: application/json" \
     -d "{\"studentId\":\"<student-id>\",\"roomId\":\"<room-id>\"}"
   ```

4. The API rejects an allocation if the student already has an active allocation, the room does not exist, or the room's recorded occupancy has reached its capacity. A successful allocation increments the room's `occupied` count.
5. To deallocate, send `DELETE /api/allocations/<allocation-id>`. This deletes the allocation record and decrements the room's `occupied` count.

The allocation model stores `studentId`, `roomId`, `allocatedFrom` (defaults to the current time), optional `allocatedTo`, and `active`. The current frontend does not call `/api/allocations`; allotments must currently be made through the API.

**Concurrency note:** allocation creation and the room occupancy update are separate database operations, not a transaction. For high-concurrency or production use, make capacity reservation atomic and use a MongoDB transaction where supported.

## API overview

All endpoints are served from `http://localhost:5000`.

| Resource | Endpoints |
| --- | --- |
| Health/info | `GET /` |
| Authentication | `POST /api/auth/login` |
| Students | `GET /api/students`, `GET /api/students/:id`, `POST /api/students`, `PUT /api/students/:id`, `DELETE /api/students/:id` |
| Rooms | `GET /api/rooms`, `POST /api/rooms`, `PUT /api/rooms/:id` |
| Allocations | `GET /api/allocations`, `POST /api/allocations`, `DELETE /api/allocations/:id` |
| Mess menu | `GET /api/mess`, `POST /api/mess` |
| Requests | `GET /api/requests`, `POST /api/requests`, `PUT /api/requests/:id` |
| Visitors | `GET /api/visitors`, `POST /api/visitors` |

## Tests and production notes

Run the frontend tests with `npm test -- --watchAll=false` or create a production frontend build with `npm run build` from `HMS/frontend`. The backend currently has no test script.

The authentication route is a demo implementation with hardcoded credentials and a placeholder token. Replace it with secure authentication before deploying for real users. Keep `.env` out of version control, configure CORS and the frontend API URL for your deployment, and use HTTPS.
