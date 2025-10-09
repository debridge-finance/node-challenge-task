#!/bin/bash

echo "Run migrations"
npm run migration:run


echo "Run seeding"
npm run db:seed

echo "Start application"
exec npm run start