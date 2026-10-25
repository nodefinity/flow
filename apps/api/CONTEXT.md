# API Context

Public Cloudflare Worker endpoints for launch and marketing operations.

## Language

**Waitlist Entry**:
An email address submitted by a visitor who wants early access to Flow. It belongs to marketing operations, not the mobile app's user model.
_Avoid_: user account, subscriber

**Platform Preference**:
The visitor's preferred early-access platform: iOS, Android, or both.
_Avoid_: device profile

**Source**:
A short string describing where the Waitlist Entry came from, usually `website`.
_Avoid_: referrer when it is not the browser referrer header

## Relationships

- **Website -> API**: Website submits Waitlist Entries to the `/waitlist` Worker endpoint
- **API -> D1**: API stores Waitlist Entries in the `waitlist_entries` table
- **API -> Mobile**: API does not create mobile app accounts or product state
