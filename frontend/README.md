# Video Store Frontend - Modular Architecture

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

## 🏗️ Architecture Overview

This frontend uses a **modular domain-driven architecture** where each business domain (Films, Users) is organized as a self-contained module.

### 📂 Directory Structure

```
src/
├── modules/
│   ├── films/           # Film management domain
│   ├── users/           # User management domain  
│   └── shared/          # Shared resources
├── styles/              # Global styles
├── App.tsx             # Main application component
└── index.tsx           # Application entry point
```

### 🎯 Module Structure

Each domain module follows a consistent structure:

```
modules/[domain]/
├── components/          # UI components for this domain
├── pages/              # Page components (route handlers)
├── services/           # API services and data fetching
├── types/              # TypeScript type definitions
└── index.ts            # Barrel export (public API)
```

## 📖 Usage Examples

### Importing from Modules

```typescript
// ✅ Clean imports using barrel exports
import { FilmList, filmService, Film } from './modules/films';
import { UserForm, userService, User } from './modules/users';
import { Loading, ErrorMessage, useApi } from './modules/shared';

// ❌ Avoid deep imports
import FilmList from './modules/films/components/FilmList';
```

### Adding New Components

1. **Create the component** in the appropriate module:
   ```typescript
   // modules/films/components/FilmCard.tsx
   export default function FilmCard() {
     return <div>Film Card</div>;
   }
   ```

2. **Export in module index**:
   ```typescript
   // modules/films/index.ts
   export { default as FilmCard } from './components/FilmCard';
   ```

3. **Use anywhere in the app**:
   ```typescript
   import { FilmCard } from './modules/films';
   ```

### Using Shared Resources

```typescript
// Custom hooks
const { data, loading, error, execute } = useApi(filmService.getAllFilms);

// Utility functions  
const formattedDate = formatDate(user.createdAt);
const isValid = isValidEmail(email);

// Shared components
if (loading) return <Loading message="Loading films..." />;
if (error) return <ErrorMessage message={error} onRetry={execute} />;
```

## 🛠️ Development Guidelines

### 1. Module Boundaries
- Keep domain logic within respective modules
- Use shared module for cross-cutting concerns
- Avoid direct imports between domain modules

### 2. Component Organization
- Co-locate component and its styles
- Use descriptive names following domain context
- Keep components focused and single-responsibility

### 3. Type Safety
- Define interfaces in module's `types/` folder
- Export types through module's barrel export
- Use shared types for common interfaces (ApiResponse, etc.)

### 4. API Services
- One service file per domain
- Use consistent patterns across services
- Handle errors at service level when possible

## 🔄 Migration from Old Structure

If you're working with the old structure, run the cleanup script:

```bash
# ⚠️  Only run after verifying new structure works
./migrate-cleanup.sh
```

This will:
- Create a backup of old folders
- Remove old `components/`, `pages/`, `services/`, `types/` folders
- Keep the new modular structure intact

## 🚀 Available Modules

### 🎬 Films Module (`modules/films/`)
- **FilmList** - Grid view of all films with search and filters
- **FilmForm** - Create/edit film form with validation
- **FilmDetail** - Detailed view of individual films
- **filmService** - API integration for film operations

### 👥 Users Module (`modules/users/`)
- **UserList** - Grid view of all users with search and filters  
- **UserForm** - Create/edit user form with validation
- **UserDetail** - Detailed view of individual users
- **userService** - API integration for user operations

### 🔧 Shared Module (`modules/shared/`)
- **Components**: Loading, ErrorMessage
- **Hooks**: useApi for API state management
- **Utils**: Date formatting, email validation, text truncation
- **Types**: Common interfaces like ApiResponse

## 📱 Responsive Design

All components are built mobile-first with responsive breakpoints:

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

## 🎨 Styling Approach

- **Global styles** in `styles/global.css`
- **Component styles** co-located with components
- **CSS Modules** or **Styled Components** can be adopted per module
- **Consistent design tokens** and color palette

## 🔮 Future Enhancements

### Planned Modules
- **Authentication** - Login/logout functionality
- **Notifications** - Toast messages and alerts
- **Analytics** - Usage tracking and metrics
- **Settings** - Application configuration

### Technical Improvements
- **State Management** - Redux/Zustand integration
- **Testing** - Jest + React Testing Library setup
- **Storybook** - Component documentation
- **Lazy Loading** - Route-based code splitting

## 🐛 Troubleshooting

### Import Errors
- Verify barrel exports in `index.ts` files
- Check file paths and naming conventions
- Ensure TypeScript compilation is clean

### Missing Dependencies
- Run `npm install` to ensure all packages are installed
- Check `package.json` for required peer dependencies

### Build Issues
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript configuration in `tsconfig.json`

## 🤝 Contributing

1. Follow the modular structure
2. Add new features in appropriate modules
3. Update barrel exports for new components
4. Maintain consistent naming conventions
5. Write tests for new functionality

---

**Happy coding! 🎉** 

The modular architecture provides a scalable foundation for building complex features while maintaining clean separation of concerns.
