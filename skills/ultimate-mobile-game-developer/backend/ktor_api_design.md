# Ktor API Design (Backend)

## Goals
- Provide clean, testable REST and WebSocket endpoints for game services.
- Emphasize boundaries between domain logic and transport.

## Architecture Overview
- Layered: Presentation (Controllers) -> Service Layer -> Domain/Repository -> Database.
- API Styles: REST for resources, WebSocket for real-time game state updates.
- DTOs and Mappings: network DTOs mapped to domain models.

## Security
- JWT for user authentication.
- Rate limiting per endpoint.
