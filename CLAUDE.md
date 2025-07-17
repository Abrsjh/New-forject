# Claude Code Rules for OpenBoard

## Project Constraints
- **NO BACKEND**: This is a frontend-only application. All data is mocked and stored locally.
- **NO SYSTEM COMMANDS**: Do not execute npm install, vite dev, or any terminal commands.
- **TDD REQUIRED**: Write tests first, then implement functionality.
- **LOCAL STATE ONLY**: Use Zustand + localStorage for all state management.

## Development Rules
1. Always write tests before implementation
2. Use mock data from src/data/mockData.js
3. Persist user preferences in localStorage
4. Follow React 18 best practices
5. Use TypeScript for type safety
6. Implement responsive design with Tailwind CSS
7. No external API calls or server dependencies

## Code Quality Standards
- Components must be functional with hooks
- Use proper TypeScript types
- Implement error boundaries
- Follow accessibility guidelines
- Use semantic HTML elements
- Optimize for mobile-first design

## File Organization
- Components in src/components/
- Stores in src/stores/
- Types in src/types/
- Utils in src/utils/
- Mock data in src/data/
- Tests co-located with components