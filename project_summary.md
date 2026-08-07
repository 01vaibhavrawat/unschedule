Unschedule - Project Overview & Feature Summary (MVP2)

Unschedule is a productivity platform centered on an AI assistant that helps users manage their calendar, tasks, habits, notes, and journal through natural conversation — rather than manual data entry alone.

This document serves as a high-level feature summary for UI/UX design purposes, outlining the core modules, screens, and user flows that need to be designed for MVP2.



What changed from the previous version: Social features (feed, communities, posts, reactions, follows, direct messaging) have been removed. In their place, this version introduces an AI assistant as the primary way users interact with their planner. The app also no longer assumes the Unschedule method by default — it's now offered as an optional setup path the assistant guides the user through.



1. Authentication & Onboarding

The entry point for the user, focused on getting them into a working calendar as quickly as possible — without forcing a specific planning methodology.





Login / Signup Screens: Standard email/password authentication.



Lightweight Initial Setup: Basic profile creation (name, timezone, preferences). No forced methodology choice here — the goal is to get the user into the app fast.



First Assistant Conversation: Immediately after signup, the assistant introduces itself and asks what the user wants to manage first (calendar, tasks, habits, etc.), rather than presenting a traditional guided tour.

2. AI Assistant (Core Feature)

The primary interface through which users interact with their planner. This is the heart of MVP2.





Conversational Chat Interface: A persistent chat panel (or dedicated chat screen on mobile) where users can type natural-language instructions.



Direct Data Modification: The assistant can create, edit, or delete calendar events, tasks, notes, and journal entries based on user instructions (e.g., "move my 3pm call to tomorrow morning," "add a note about today's client meeting").



Daily Planning Conversation: When a user opens the app, the assistant surfaces what's on the calendar for today and proactively asks what they need to focus on — matching a "morning check-in" ritual rather than a static dashboard.



Schedule Feedback & Prioritization: The assistant should be opinionated, not passive. It should:





Flag when a day is over-scheduled with insufficient free/buffer time



Point out open gaps (e.g., "You're free from 2–4pm")



Suggest what could be deprioritized or moved when the schedule is too full



Guided Unschedule Setup (Optional Path): If a user wants to plan using the Unschedule method, the assistant walks them through a short guided Q&A to scaffold their week automatically, asking things like:





What time do you normally sleep and wake up?



What are your working hours?



When do you go to the gym (if at all)?



When do you typically eat your meals?



What other recurring commitments take up your time (hobbies, classes, errands)?

 Based on the answers, the assistant pre-fills a draft weekly schedule for the user to review and adjust, rather than leaving them to build it from a blank calendar.



Habit Suggestions: Based on the user's stated goals or existing schedule, the assistant proactively suggests atomic habits the user might want to adopt, and can create them directly on request.



Assistant Action Confirmation: Since the assistant can modify real data, actions it takes (creating/editing/deleting events, tasks, notes, journal entries) should show a clear confirmation or undo affordance in the chat, not happen silently.

3. Productivity & Personal Management

The core suite of tools for users to manage their time, goals, and habits — now editable either manually or via the assistant.





Dashboard & Calendar: A calendar interface (day/week/month views) displaying tasks, events, and logged habits. Supports both traditional scheduling and Unschedule-style planning, depending on what the user has set up.



Todo & Task Management:





Interface for creating and managing tasks manually.



Supports start/end times, statuses (pending/completed), and recurrence rules.



Mini Habits:





Habit tracking interface where users define habits and their frequencies.



Daily logging (checking off completed habits) and streak visualizations.



Can be created manually or accepted from an assistant suggestion.



Goals:





Visual representations of long-term goals.



Supports descriptions and color-coding for categorization.

4. Knowledge & Reflection

Tools for personal writing and organization, also editable via the assistant.





Notes:





A rich-text note-taking interface.



Organized via a folder structure and tags.



Assistant can create or append to notes from a conversation (e.g., "save that as a note").



Journal:





Date-based journal entries for daily reflections.



Assistant can prompt the user for a journal entry (e.g., at end of day) and log it on their behalf from the conversation.

5. Notifications & Reminders

Repurposed from alerts about other users to assistant-driven, personal nudges.





Reminders: Upcoming events, task due dates, and habit check-ins.



Assistant Nudges: Proactive prompts from the assistant, such as an incomplete daily journal entry, an unusually packed schedule, or a habit streak at risk.



Notification Center: A simple alerts list/dropdown showing recent reminders and nudges, with read/unread state.

Design Considerations & Tech Stack Context





Tech Stack: Built with Next.js (React), TailwindCSS, and Lucide Icons. The rich text editor uses Tiptap, and the calendar relies on FullCalendar. MVP2 adds an AI/LLM integration layer for the assistant's natural-language understanding and action execution.



Chat UI Considerations: Message bubbles, typing/thinking indicators, and clear visual treatment for assistant actions (e.g., an inline card showing "Created: Gym — 6:00 AM" when the assistant adds an event) so users can see and confirm what changed without leaving the chat.



Navigation: With social modules removed, navigation simplifies to Calendar, Tasks, Habits, Goals, Notes, Journal, and the Assistant chat — a collapsible sidebar is still recommended given the number of modules.



Onboarding Flexibility: UI should clearly support two calendar modes (traditional vs. Unschedule) without making either feel like the "default correct" choice — the assistant's guided setup should feel like a helpful option, not a forced path.



Aesthetics: Clean, modern, and uncluttered — balancing the density of a productivity tool (calendars, task lists) with the conversational, lightweight feel of a chat assistant.



States & Micro-interactions: Pay attention to visual states of tasks (completed vs. pending), habit streaks, assistant typing/processing states, and action-confirmation cards within the chat.

