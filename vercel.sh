#!/bin/bash

echo "VERCEL_ENV is set to: '$VERCEL_ENV'"
 
if [[ $VERCEL_ENV == "production" ]] ; then 
  npm run build:production
else
  echo "Unknown VERCEL_ENV value: $VERCEL_ENV"
  exit 1
fi