# User-Management
1. Signup
curl --location 'http://localhost:3000/users/signup' \
--header 'Content-Type: application/json' \
--data-raw '{
  "name": "John Doe",
  "mobile": "8812374832",
  "password": "Seyrud@123"
}'

2. login
   curl --location 'http://localhost:3000/users/signup' \
--header 'Content-Type: application/json' \
--data-raw '{
  "name": "John Doe",
  "mobile": "8812374832",
  "password": "Seyrud@123"
}'
