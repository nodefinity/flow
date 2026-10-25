# Landing Page Context

The public landing page for Flow. It exists to explain the product concept and collect user research leads before the product is ready for distribution.

## Language

### Landing Page

**Landing Page**:
The single public marketing surface for Flow. It explains the product promise and routes interested visitors to the user research form.
_Avoid_: website, app, dashboard, docs

**User Research Lead**:
An email address from a visitor who is interested in being contacted for product discovery or early concept validation.
_Avoid_: user account, subscriber, customer

**Survey Form**:
The form that collects email and platform preference for follow-up research.
_Avoid_: signup, checkout

### Product Framing

The Landing Page should describe Flow using the Radio context language:

- User-facing hook: a private AI radio built from the user's local music library
- Product terms: Channel, Host, Programme, Interlude, Intervention
- Avoid positioning Flow as only a generic music player

## Relationships

- **Landing Page -> API**: Landing Page submits User Research Leads to the `/waitlist` Worker endpoint with source `survey`
- **Landing Page -> Radio**: Landing Page explains the Radio experience without exposing implementation details
- **Landing Page -> Mobile**: Landing Page should not promise distribution availability until a test build exists
