/\*
----------------- AI workflow --------------
Ai is used for: intent, step, context
extraction
summarization
classification
natural language understanding

Avoid:
long-term memory reasoning
business logic
state mutation decisions

---

needed to do:
Booking flow:
collect name
collect date
collect location
confirm
create booking
This should be backend-controlled.
Not prompt-controlled.

---

\*/

\*
------- The full flow of how AGENT & tools get created and load in the conversation --------

Business signs up
↓
createBusiness() runs
↓
seedTools() creates 5 tool docs, all enabled: false
↓
Business owner sets up their agent
POST /api/agent { businessId, prompt, tone, language }
↓
Business owner enables the tools they want
PATCH /api/tools/bulk { businessId, tools: [{ name: "createBooking", enabled: true }] }
↓
Customer starts chatting
↓
Socket loads Agent + enabled Tools from DB
↓
AI uses business prompt/tone, only runs enabled tools

\*/

----------- Agent with tools flow algorithm --------
What can this business do? → check Tool collection
How should the AI behave? → check Agent collection

Business onboards
└── seedTools() — all tools created, disabled by default
└── upsertAgent() — prompt + tone saved

Business enables tools
└── PATCH /tools/bulk — toggle what they want on

Customer starts chatting
└── Socket connects
└── verifyBusiness middleware — loads business from owner token
└── loadAgentConfig() — loads Agent + enabled Tools from DB

Every message
└── runGraph({ text, history, state, agent, tools })
└── aiNode — uses business prompt + tone
└── toolNode — only runs enabled tools

---
