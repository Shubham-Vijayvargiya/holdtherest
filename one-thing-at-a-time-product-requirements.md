# One Thing at a Time
## Product Requirements and Design Brief

**Document purpose:** Build-ready brief for Antigravity or another AI app builder  
**Product type:** Responsive web app / Progressive Web App (PWA)  
**Primary users:** Individuals who feel mentally overloaded by many competing tasks  
**Initial users:** Ankita and her wife  
**Authentication:** Google account sign-in  
**Working title:** One Thing at a Time

---

## 1. Product Vision

Create a calm, simple task-focus tool that helps users capture everything on their mind, choose only a few priorities, and focus on one task without worrying that other tasks will be forgotten.

The app should reduce the anxiety caused by:

- Keeping too many tasks in memory
- Feeling that everything is equally urgent
- Switching between tasks
- Worrying that choosing one task means neglecting another
- Wanting to work on several things simultaneously

The app should reassure the user:

> Everything is captured. Nothing is being lost. You only need to work on one thing right now.

This should not feel like a traditional productivity dashboard. It should feel supportive, lightweight, and calming.

---

## 2. Problem Statement

Users may know what they need to do and how to do it, but still struggle to begin or continue because their attention repeatedly moves to other responsibilities.

Most task-management tools can make this worse by displaying long lists, deadlines, categories, alerts, overdue counts, and productivity metrics.

The product should solve a narrower problem:

1. Capture every competing thought quickly.
2. Help the user choose a small number of tasks for today.
3. Let the user select one current focus.
4. Provide a safe place for distracting thoughts that appear during the focus session.
5. Preserve all information across devices and sessions.
6. Avoid creating additional pressure.

---

## 3. Product Principles

### 3.1 Capture before organizing

Users should be able to save a thought in seconds without selecting a project, date, label, priority, or category.

### 3.2 One visible focus

When a focus session begins, the current task should become the main object on the screen. Other tasks should remain saved but visually secondary.

### 3.3 Reassurance over pressure

Use supportive language instead of urgency, guilt, streaks, or aggressive reminders.

Examples:

- “Everything else is safely captured.”
- “You only need to focus on this task right now.”
- “This thought has been parked. You can return to it later.”
- “Progress counts, even when the task is not finished.”

Avoid language such as:

- “You are behind.”
- “You missed your goal.”
- “Overdue.”
- “Productivity score.”
- “You broke your streak.”

### 3.4 Minimal decisions

Do not require users to make many choices before starting.

### 3.5 No hidden loss

Users must trust that their tasks are saved automatically and associated with their account.

### 3.6 Private by default

Each user should only see their own tasks, focus sessions, and notes.

---

## 4. Target Users

### Primary persona

A person who:

- Has several personal, professional, family, learning, or administrative responsibilities
- Understands what needs to be done
- Feels anxious when choosing between tasks
- Frequently changes tasks before finishing
- Feels relief when information is captured in a trusted system
- Prefers digital tools over writing on paper

### Secondary persona

A spouse, partner, family member, or friend who has similar mental-overload challenges and wants to use the app independently.

### Future persona

A user who may want to optionally share one task list or focus plan with a partner without exposing all private tasks.

Partner sharing is not required for the first version.

---

## 5. Core User Journey

### First-time experience

1. User opens the app.
2. User sees a short explanation:
   - Capture everything
   - Pick today’s three
   - Focus on one
3. User selects **Continue with Google**.
4. The app creates a private user profile.
5. User enters one or more tasks through a simple input.
6. User selects up to three tasks for today.
7. User identifies one task as the current focus.
8. User starts a focus session.
9. During the session, the user can park distracting thoughts.
10. At the end, the user marks the task:
    - Completed
    - Made progress
    - Continue later

### Returning-user experience

1. User signs in automatically or through Google.
2. The app opens to the **Today** screen.
3. The app displays:
   - Current focus task, if one exists
   - Today’s selected tasks
   - Quick capture field
4. The user can immediately continue focusing or adjust the day’s tasks.

---

## 6. Information Architecture

The primary navigation should contain no more than four sections:

1. **Today**
2. **All Tasks**
3. **Parking Lot**
4. **Settings**

A mobile bottom-navigation pattern is preferred. On desktop, use a compact sidebar or top navigation.

Do not create separate pages for analytics, projects, calendar, habits, or teams in the MVP.

---

## 7. Screen Requirements

## 7.1 Welcome and Login Screen

### Purpose

Explain the product simply and provide Google-based authentication.

### Content

**Headline:**

> You do not have to hold everything in your mind.

**Supporting text:**

> Capture what is competing for your attention, choose what matters today, and focus on one thing at a time.

### Primary action

**Continue with Google**

### Authentication requirements

- Use Google OAuth 2.0 or a supported authentication provider with Google sign-in.
- Recommended implementations:
  - Firebase Authentication with Google provider
  - Supabase Auth with Google provider
  - Auth0 with Google connection
- The user should not need to create a separate password.
- Request only the minimum information required:
  - Google account identifier
  - Name
  - Email address
  - Profile image, optional
- Do not request access to Gmail, Google Drive, Google Calendar, contacts, or other Google data.
- Display a privacy notice explaining that Google is used only for authentication.
- Support sign-out.
- Support account deletion.
- Keep each user’s data isolated by authenticated user ID.

### Optional first-use step

Ask the user what they would like to be called. Prepopulate this from their Google profile but allow editing.

---

## 7.2 Today Screen

### Purpose

Serve as the user’s calm home screen.

### Sections

#### A. Quick Capture

- Single-line input
- Placeholder: “What is on your mind?”
- Button: “Capture”
- Pressing Enter should also save the task
- Do not require category, due date, or priority
- Confirm saving with subtle feedback:
  - “Captured. You do not need to remember it now.”

#### B. Current Focus

If a focus task exists, display it prominently.

Content:

- Current task title
- Optional small next step
- Focus timer
- Button: “Start focus”
- Button: “Continue”
- Button: “Pause”
- Button: “I made progress”
- Button: “Done”

Reassurance:

> Everything else is safely captured.

If no focus task exists:

> Choose one task to focus on. You are not choosing it forever—only for the next session.

#### C. Today’s Three

Allow the user to select a maximum of three active tasks:

- One **Must Do**
- Up to two **Should Do**

The labels can be editable in future versions, but use these defaults for the MVP.

When three tasks are already selected, show:

> Today’s three are full. Remove or complete one before adding another.

Do not prevent the user from keeping additional tasks in the general backlog.

#### D. Parking Lot Preview

Show recently parked thoughts from the current focus session.

Each item can be:

- Moved to All Tasks
- Dismissed
- Left in the Parking Lot

---

## 7.3 All Tasks Screen

### Purpose

Store every captured task so the user knows nothing is being forgotten.

### Requirements

- Display active tasks
- Display completed tasks in a collapsible section
- Search tasks
- Basic filters:
  - Active
  - Today
  - Completed
- Sort options:
  - Recently added
  - Oldest first
- Add task
- Edit task
- Delete task
- Mark complete
- Add to Today
- Start focus

### Task fields

#### Required

- Task ID
- User ID
- Task title
- Status
- Created timestamp
- Updated timestamp

#### Optional

- Notes
- Next step
- Today slot
- Completion timestamp
- Archived timestamp
- Source: quick capture, parking lot, manual
- Estimated focus duration

### Avoid in MVP

- Complex projects
- Multiple priority levels
- Dependencies
- Recurring tasks
- Nested subtasks beyond one simple “next step”
- Kanban boards
- Calendar scheduling

---

## 7.4 Focus Screen

### Purpose

Help the user work on one task without seeing the full backlog.

### Visual hierarchy

The current task should occupy most of the screen.

Display:

- Task title
- Optional next step
- Timer
- Parking Lot input
- Small reassurance message
- Session controls

### Default timer

- Default: 25 minutes
- Presets:
  - 10 minutes
  - 25 minutes
  - 45 minutes
- Allow the user to continue without a timer.
- Timer preferences should be remembered per user.

### Session controls

- Start
- Pause
- Resume
- End session
- Mark done
- Made progress
- Continue later

### Parking Lot input

Placeholder:

> Another thought appeared? Park it here.

When saved:

> Thought parked. Return to the task in front of you.

The parked item should not automatically interrupt the focus screen.

### End-of-session check-in

At the end of a focus session, ask one simple question:

> What happened during this session?

Options:

- Completed
- Made progress
- Need another session
- Changed my mind

Do not ask the user to rate productivity.

---

## 7.5 Parking Lot Screen

### Purpose

Provide a trusted place for thoughts that arise during focused work.

### Requirements

Each parked thought should display:

- Text
- Date and time
- Related focus task, when available
- Action: Move to tasks
- Action: Dismiss
- Action: Keep parked

Allow bulk action:

- Move all to All Tasks
- Clear dismissed thoughts

The Parking Lot should feel temporary and forgiving.

---

## 7.6 Settings Screen

### Account

- Name
- Email
- Google profile image
- Sign out
- Delete account

### Focus preferences

- Default focus duration
- Sound at session end: on/off
- Gentle confirmation messages: on/off
- Automatically open current focus after login: on/off

### Appearance

- Light mode
- Dark mode
- System setting

### Privacy

- Explain what information is stored
- Explain that Google is used only for sign-in
- Export personal data
- Delete all task data
- Delete account

### Optional future setting

- Private partner sharing

---

## 8. Functional Requirements

## 8.1 Authentication and accounts

- Users must authenticate using Google.
- Each user must have an independent account.
- Data must be filtered by authenticated user ID on every database request.
- A user must never be able to access another user’s records by changing a URL or API parameter.
- Sessions should persist securely.
- Signing out should clear local authenticated state.
- Account deletion should remove or anonymize all associated data according to the privacy policy.

## 8.2 Task capture

- Save a task with one action.
- Newly captured tasks should appear immediately.
- Saving should work on mobile and desktop.
- Prevent accidental duplicate submissions caused by double-clicking.
- Trim leading and trailing spaces.
- Do not save empty tasks.
- Set a reasonable maximum title length, such as 300 characters.

## 8.3 Today selection

- Maximum three tasks selected for Today.
- One task can occupy the Must Do position.
- Two tasks can occupy the Should Do positions.
- A task can be removed from Today without being deleted.
- Completed Today tasks should remain visible until the user resets the day or the next local day begins.
- The app should use the user’s local timezone.

## 8.4 Focus sessions

- Only one task can be the current focus at a time.
- Focus session state should survive browser refresh.
- Timer should continue accurately if the screen locks or browser tab becomes inactive.
- Save:
  - Start time
  - End time
  - Planned duration
  - Actual duration
  - Outcome
- The user can focus without starting a timer.

## 8.5 Parking Lot

- A parked thought should save instantly.
- It may optionally link to the active focus task and focus session.
- Moving it to All Tasks should preserve its original creation date or record the moved date.
- Dismissing it should require only one action.
- Provide undo after dismissal or deletion.

## 8.6 Autosave and synchronization

- All changes should autosave.
- Show subtle status:
  - Saving
  - Saved
  - Unable to save
- Retry failed saves.
- Prevent data loss when the user refreshes or closes the app.
- Synchronize across devices after sign-in.

---

## 9. Suggested Data Model

The exact schema may vary by platform.

## 9.1 users

| Field | Type | Notes |
|---|---|---|
| id | UUID | Internal primary key |
| auth_provider_id | String | Google/Firebase/Supabase identity |
| email | String | Unique |
| display_name | String | Editable |
| photo_url | String | Optional |
| timezone | String | Default from browser |
| default_focus_minutes | Integer | Default 25 |
| created_at | Timestamp | Required |
| updated_at | Timestamp | Required |

## 9.2 tasks

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users |
| title | String | Required |
| notes | Text | Optional |
| next_step | String | Optional |
| status | Enum | active, completed, archived |
| today_slot | Enum | must_do, should_do_1, should_do_2, null |
| is_current_focus | Boolean | Only one per user |
| source | Enum | quick_capture, parking_lot, manual |
| created_at | Timestamp | Required |
| updated_at | Timestamp | Required |
| completed_at | Timestamp | Optional |
| archived_at | Timestamp | Optional |

## 9.3 focus_sessions

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | Foreign key |
| task_id | UUID | Foreign key |
| started_at | Timestamp | Required |
| ended_at | Timestamp | Optional |
| planned_minutes | Integer | Optional |
| actual_seconds | Integer | Optional |
| status | Enum | active, paused, completed, abandoned |
| outcome | Enum | completed, progress, continue_later, changed_mind |
| created_at | Timestamp | Required |

## 9.4 parked_thoughts

| Field | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| user_id | UUID | Foreign key |
| focus_session_id | UUID | Optional |
| related_task_id | UUID | Optional |
| text | String | Required |
| status | Enum | parked, moved_to_task, dismissed |
| converted_task_id | UUID | Optional |
| created_at | Timestamp | Required |
| updated_at | Timestamp | Required |

## 9.5 user_preferences

| Field | Type | Notes |
|---|---|---|
| user_id | UUID | Primary key and foreign key |
| theme | Enum | system, light, dark |
| default_focus_minutes | Integer | Default 25 |
| session_end_sound | Boolean | Default false |
| supportive_messages | Boolean | Default true |
| open_focus_on_login | Boolean | Default false |
| updated_at | Timestamp | Required |

---

## 10. API or Backend Actions

Suggested service actions:

### Authentication

- Sign in with Google
- Sign out
- Get current user
- Delete account

### Tasks

- Create task
- List user tasks
- Update task
- Delete task
- Complete task
- Archive task
- Assign Today slot
- Remove Today slot
- Set current focus

### Focus sessions

- Start session
- Pause session
- Resume session
- End session
- Record outcome
- Retrieve current active session

### Parking Lot

- Create parked thought
- List parked thoughts
- Convert parked thought to task
- Dismiss parked thought
- Undo dismissal

### Preferences

- Get preferences
- Update preferences

Every action must verify the authenticated user and ownership of the requested record.

---

## 11. UX and Visual Design Direction

### Desired feeling

- Calm
- Spacious
- Trustworthy
- Warm
- Non-clinical
- Non-corporate
- Simple
- Supportive

### Layout

- Mobile-first responsive design
- Generous spacing
- One clear primary action per section
- No dense dashboards
- No large tables on mobile
- Avoid displaying the complete backlog on the focus screen

### Color

Use a soft neutral background with one calming accent color. Support light and dark mode.

Do not rely on color alone to communicate status.

### Typography

- Highly readable sans-serif font
- Clear hierarchy
- Comfortable line spacing
- Avoid very small helper text

### Motion

- Use subtle transitions
- Avoid celebratory animations that may feel childish
- Avoid constant movement
- Respect reduced-motion accessibility settings

### Empty states

Use encouraging and informative empty states.

Examples:

**No tasks:**

> Your mind is clear here. Capture something whenever it comes up.

**No Today tasks:**

> Choose one task that would make today feel lighter.

**No Parking Lot items:**

> Nothing is waiting here right now.

---

## 12. Accessibility Requirements

- Meet WCAG 2.1 AA where practical.
- Full keyboard navigation.
- Visible focus indicators.
- Semantic labels for controls.
- Sufficient text contrast.
- Screen-reader announcements for:
  - Task saved
  - Thought parked
  - Timer ended
  - Save failure
- Do not use color alone to show selected, completed, or active states.
- Support browser text zoom.
- Respect reduced-motion preferences.
- Touch targets should be at least approximately 44 by 44 pixels.

---

## 13. Privacy and Security Requirements

### Privacy

- Google login is used only to authenticate the user.
- Do not request Gmail, Calendar, Drive, or Contacts permissions.
- Do not sell or share task content.
- Do not use private task text for advertising.
- Provide clear data deletion controls.
- Provide a basic privacy policy before public launch.

### Security

- Use HTTPS.
- Store authentication tokens securely.
- Do not store Google passwords.
- Use row-level security or equivalent server-side authorization.
- Validate all inputs on the server.
- Protect against cross-site scripting, injection, and unauthorized record access.
- Keep secrets in environment variables.
- Log security-relevant events without logging private task content.
- Apply rate limits to authentication and write endpoints.

### Multi-user isolation

This is essential because Ankita and her wife will use separate Google accounts.

Acceptance requirement:

> When User A signs in, User A must never see User B’s tasks, focus sessions, parked thoughts, preferences, or account information.

---

## 14. Emotional-Safety Design

The product supports focus and organization but should not present itself as medical treatment.

Include a brief statement in Settings or About:

> One Thing at a Time is a planning and focus tool. It is not a substitute for professional mental-health care.

Do not:

- Diagnose anxiety
- Claim to treat anxiety
- Shame the user
- Create compulsive streaks
- Reward excessive work duration
- Encourage the user to ignore urgent real-world responsibilities
- Send frequent notifications by default

If reminders are added later, they should be optional and gentle.

---

## 15. MVP Scope

The first usable version should include:

1. Google sign-in
2. Private account and user data
3. Quick task capture
4. All Tasks list
5. Today’s Three
6. One current focus task
7. Focus timer with 10, 25, and 45 minute options
8. Parking Lot during focus
9. Complete, progress, and continue-later outcomes
10. Autosave
11. Responsive mobile and desktop layouts
12. Light, dark, and system themes
13. Sign out
14. Delete account
15. Basic privacy and security protections

---

## 16. Features for Later Versions

Do not include these in the initial build unless the MVP is already stable:

- Partner sharing
- Shared household list
- Google Calendar integration
- Voice capture
- Browser extension
- Mobile widgets
- AI-assisted task breakdown
- AI-generated next steps
- Smart daily planning
- Recurring tasks
- Gentle reminders
- Weekly reflection
- Data export
- Offline support
- Native iOS and Android applications

### Potential AI feature

A user could select a task and ask:

> Help me identify the smallest next step.

The AI should suggest one concrete action rather than generating a long project plan.

Example:

Task: “Update my resume”

Suggested next step:

> Open the latest resume and rewrite only the professional summary.

AI features should remain optional and should never reorganize or delete user data without confirmation.

---

## 17. Key Acceptance Criteria

### Login

- A user can sign in with a Google account.
- A returning user remains signed in according to secure session rules.
- A user can sign out.
- A user can delete their account.
- No permissions beyond basic Google identity are requested.

### Task capture

- A user can enter a task and save it with one click or Enter.
- The saved task appears immediately.
- The task remains after refresh and on another signed-in device.
- Empty tasks cannot be saved.

### Today’s Three

- A user can select no more than three tasks.
- The interface clearly identifies one Must Do and up to two Should Do tasks.
- Removing a task from Today does not delete it.

### Current focus

- A user can choose one current focus task.
- Choosing a new focus replaces the previous current focus.
- The focus state remains after refresh.
- The full backlog is not prominently displayed on the focus screen.

### Timer

- A user can use 10, 25, or 45 minutes.
- The user can pause and resume.
- The timer remains accurate when the tab is inactive.
- The user can focus without using a timer.

### Parking Lot

- A user can save a distracting thought during a focus session.
- The saved thought appears in the Parking Lot.
- The thought can be moved to All Tasks.
- Parking a thought does not exit the focus screen.

### Account isolation

- Two users signing in with different Google accounts receive separate datasets.
- Direct API calls cannot retrieve another user’s records.
- All database queries are scoped to the authenticated user.

---

## 18. Suggested Technical Architecture

### Option A: Fastest MVP

- **Frontend:** Next.js or React
- **UI:** Tailwind CSS
- **Authentication:** Supabase Auth with Google
- **Database:** Supabase PostgreSQL
- **Authorization:** Supabase Row Level Security
- **Hosting:** Vercel
- **Analytics:** Privacy-conscious product analytics, optional

### Option B: Google-centered stack

- **Frontend:** Next.js or React
- **Authentication:** Firebase Authentication with Google
- **Database:** Cloud Firestore
- **Hosting:** Firebase Hosting or Vercel
- **Backend:** Firebase Cloud Functions, only if required

### Recommendation

Use **Supabase Auth + PostgreSQL + Row Level Security** if the builder supports it well. The relational model is straightforward, and row-level security provides a strong way to isolate each user’s data.

Use **Firebase** if Antigravity has significantly better built-in support for Google login and deployment through Firebase.

---

## 19. Suggested Row-Level Access Rule

Conceptually, every user-owned table should enforce:

```sql
record.user_id = authenticated_user.id
```

Apply this rule to:

- tasks
- focus_sessions
- parked_thoughts
- user_preferences

Users may create, read, update, and delete only records where the `user_id` matches their authenticated account ID.

Do not rely only on filtering in the user interface.

---

## 20. Suggested Initial Prompts for Antigravity

### Main build prompt

Build a responsive web application called **One Thing at a Time**. It should help users capture all tasks competing for their attention, choose a maximum of three tasks for today, and focus on one task at a time.

Use Google account sign-in. Each Google account must have a completely separate and private dataset. Request only basic Google identity permissions and do not request Gmail, Calendar, Drive, or Contacts access.

The app should include:

1. A welcome and Google login screen
2. A Today screen with Quick Capture, Current Focus, Today’s Three, and Parking Lot preview
3. An All Tasks screen
4. A distraction-free Focus screen with an optional 10, 25, or 45 minute timer
5. A Parking Lot for thoughts that appear during focus
6. A Settings screen with theme, focus duration, sign-out, data deletion, and account deletion
7. Autosave and cross-device synchronization
8. Light, dark, and system themes
9. Mobile-first responsive design
10. Strong user-level data isolation

Use calm, supportive language. Avoid overdue labels, productivity scores, streaks, guilt, and dense dashboards.

### UI prompt

Design the app to feel calm, spacious, and reassuring rather than like a traditional productivity platform. Use one soft accent color, neutral backgrounds, generous spacing, clear typography, and a single primary action per section.

On the Focus screen, make the selected task the dominant visual element and keep the full backlog out of view. Show the message:

> Everything else is safely captured.

### Authentication prompt

Implement Google OAuth login using the platform’s recommended secure authentication method. Store each user’s data under a unique authenticated user ID. Enforce server-side authorization or row-level security so users cannot read or modify another account’s data.

Request only name, email, Google account identifier, and optional profile photo. Do not request access to Gmail, Calendar, Contacts, Drive, or any other Google service.

### Database prompt

Create database tables for users, tasks, focus sessions, parked thoughts, and user preferences. Every user-owned record must contain a user ID. Apply authorization rules to ensure the authenticated user can access only records belonging to that same user ID.

### Testing prompt

Create tests for:

- Google login and sign-out
- Separate data for two different Google accounts
- Quick task capture
- Maximum of three Today tasks
- Only one current focus task
- Timer pause and resume
- Parking a thought during focus
- Moving a parked thought into All Tasks
- Persistence after refresh
- Account and data deletion
- Unauthorized access attempts to another user’s data

---

## 21. Example Interface Copy

### Quick Capture

**Label:** What is on your mind?  
**Button:** Capture  
**Confirmation:** Captured. You do not need to remember it now.

### Today

**Heading:** What would make today feel lighter?

### Current Focus

**Heading:** Right now, only this matters.  
**Support:** Everything else is safely captured.

### Parking Lot

**Prompt:** Another thought appeared? Park it here.  
**Confirmation:** Thought parked. Return to the task in front of you.

### Focus completion

**Question:** What happened during this session?

Options:

- I completed it
- I made progress
- I need another session
- I changed my mind

### Empty task list

> Your mind is clear here. Capture something whenever it comes up.

### Save error

> This did not save yet. Your text is still here, and we are trying again.

### Delete account warning

> This will permanently delete your tasks, focus sessions, parked thoughts, and preferences. This action cannot be undone.

---

## 22. Definition of Done for Version 1

Version 1 is ready for Ankita and her wife to test when:

- Both can sign in with separate Google accounts.
- Each sees only her own data.
- Tasks remain saved after refresh and across devices.
- Each can capture tasks, choose Today’s Three, focus on one task, and park distracting thoughts.
- The timer works reliably.
- The experience is usable on a phone and desktop.
- The interface feels calm and does not pressure the user.
- Account sign-out and deletion work.
- Basic accessibility, privacy, and security requirements are met.
- No Gmail, Google Calendar, Google Drive, or Google Contacts permission is requested.

---

## 23. Product Success Indicators

For early private testing, use qualitative measures rather than productivity scoring.

Ask users:

- Did the app make it easier to begin one task?
- Did capturing other thoughts reduce the urge to switch tasks?
- Did the user trust that nothing was being forgotten?
- Did Today’s Three feel manageable?
- Did any part of the interface create additional pressure?
- Did the user return to the app the next day?
- Was Google sign-in simple?
- Did each person feel confident that her information was private?

The core success signal is:

> The user can focus on one selected task while feeling confident that everything else is safely captured.
