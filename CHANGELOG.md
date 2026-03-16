# Changelog

All notable changes to this project will be documented in this file.


## [v2.0.0] - Latest Release
- Migrated project from JavaScript to TypeScript, with surprisingly minimal issues
- Added type definitions for essentially everything: API Responses, all used data structures (Note, Dates, Display structures), functions, components
- Updated Vite config for TS support
- Created NotesProvider and custom useNotes hook to mitigate prop drilling and isolate fetching of Notes from the backend

## [Unreleased]
In the upcoming future, the following will be added:
- Authentication Provider, thus, user creation
- More text-editing features
- Better loading and error handling states

And the creative mind wanders:
- Ability to post notes for others

## [v1.0.0] - 2026-02-23
- Initial release in JavaScript
- Core functionality working
- Basic README documentation - check it out!!