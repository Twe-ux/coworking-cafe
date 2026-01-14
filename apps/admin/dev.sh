#!/bin/bash

# Unset system MONGODB_URI to use .env.local instead
unset MONGODB_URI

# Start development server
pnpm dev
