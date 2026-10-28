#!/usr/bin/env bash
set -e
cd /home/server/Programming/ecoscan/frontend
npx --yes create-vite . --template react-ts
npm install
npm install lucide-react clsx tailwind-merge
npm install -D tailwindcss postcss autoprefixer vitest jsdom @testing-library/react @testing-library/jest-dom @types/node
npx --yes tailwindcss init -p
echo "Frontend scaffolded successfully"
