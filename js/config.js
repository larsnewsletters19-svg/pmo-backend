// ============================================
// PMO AI ASSISTANT - CONFIGURATION
// v8.7.0 - Code Split
// ============================================

// SUPABASE SETUP
const SUPABASE_URL = 'https://zcdjwtyxehfrkyhnpekq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjZGp3dHl4ZWhmcmt5aG5wZWtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUxOTEyNDYsImV4cCI6MjA4MDc2NzI0Nn0.Pg0etjmcDrgE30R0ERXpESxfAGyxhR2cqMnCGArEn9o';

// Backend URL - Railway server
const BACKEND_URL = window.location.hostname.includes('github.io')
    ? 'https://web-production-5822.up.railway.app'  // GitHub Pages prod → Railway prod backend
    : window.location.origin;                        // Railway dev/prod → använder sig själv

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Document Types
const DOCUMENT_TYPES = [
    { id: 'weekly', name: 'Weekly Report', nameSv: 'Veckorapport' },
    { id: 'meeting', name: 'Meeting Summary', nameSv: 'Mötesprotokoll' },
    { id: 'risk', name: 'Risk Log', nameSv: 'Risklogg' },
    { id: 'action', name: 'Action Log', nameSv: 'Actionlogg' },
    { id: 'userstory', name: 'User Stories', nameSv: 'User Stories' },
    { id: 'steering', name: 'Steering Slides', nameSv: 'Styrgruppsslides' },
    { id: 'milestones', name: 'Milestones & Timeline', nameSv: 'Milstolpar & Tidslinje' },
    { id: 'trends', name: 'Trends', nameSv: 'Trender' },
    { id: 'project', name: 'Project Report', nameSv: 'Projektrapport' }
];

// Analysis Types
const ANALYSIS_TYPES = [
    { id: 'pmo', name: 'PMO-analys', description: 'Risker, blockerare, gap, mitigeringar' },
    { id: 'requirements', name: 'Kravanalys', description: 'User stories, epics, acceptanskriterier' },
    { id: 'meeting', name: 'Mötesanalys', description: 'Beslut, actions, implicita risker' }
];

// Master Format
const MASTER_FORMAT = `MASTER FORMAT – Globala regler för alla dokument

1. Rubriknivåer
* H1 = huvudsektion
* H2 = underrubrik
* H3 = detaljnivå

2. Punktlistor
* • = standardpunkt
* – = fördjupningspunkt
* 1. / 2. / 3. = numrerad lista

3. Tabeller (markdown-standard)
* max 6 kolumner
* korta, tydliga celler
* ingen tom rad mellan rader
* konsekvent kolumnordning

Standard risktabell:
Risk | Impact | Likelihood | Severity | Trend | Mitigation | Owner

Standard actiontabell:
Action | Owner | Deadline | Status

Standard decisiontabell:
Decision | Date | Owner | Impact

4. Språk & Ton
* professionell
* rak och konsultmässig
* inga utsvävningar
* max 3–4 meningar per stycke
* inga emojis
* presentationsredo språk
* konsekvent begreppsanvändning

5. Dokumentstruktur (alla dokument börjar med Summary)
1. Summary (3–6 bullets, inga detaljer)
2. Body (rubriker enligt mall)

6. Riskformat (globalt)
* riskbeskrivning
* Impact (Low/Medium/High)
* Likelihood (Low/Medium/High)
* Severity = Impact × Likelihood
* Trend (↑ / → / ↓)
* Mitigation
* Owner

7. Actionformat
* korta rader (max 10 ord)
* Deadline i formatet YYYY-MM-DD
* Status = Not started / In progress / Done

8. Decisionformat
Som bullets:
• Beslut: X
• Orsak: Y
• Påverkan: Z

9. Mötesprotokoll-standard
1. Summary
2. Key Discussion Points
3. Decisions
4. Actions
5. Next Steps
6. Risks
7. Links (om relevant)

10. Slide-standard
* Titel (max 6 ord)
* 3–5 bullets
* Key Message
* Risk eller dependency
* Presenter Notes

11. User Story-standard
Som {roll} vill jag {mål} så att {nytta}.
Acceptanskriterier:
• Givet att …
• När …
• Då …

12. Övergripande regler
* inga texter längre än 4 meningar
* inga upprepningar
* samma begrepp varje gång
* alltid presentationsredo

13. DATUM-SEKTIONSFORMAT
Rådata struktureras med datum-sektioner:

=YYYY-MM-DD=           ← Datum-tag (obligatorisk)
=MÖTE=                 ← Möte-tag (valfri, endast för möten)
text här               ← Rådata innehåll
===                    ← Slut-tag (obligatorisk)

Exempel:
=2024-12-02=
Login-modul klar
50 testanvändare
===

=2024-12-03=
=MÖTE=
API-design diskussion
Beslut: REST approach
Action: Sara specificerar API onsdag
===

AI ska läsa datum från dessa sektioner och förstå tidslinjer automatiskt.`;

// Swedish Master Prompt
const SWEDISH_MASTER_PROMPT = `Du är min PMO-assistent.
Du ska alltid producera text enligt MASTER FORMAT.
Följ rubriknivåer, punktstilar, tabellformat, språkstil och alla standarder exakt.

När du skriver text åt mig ska du alltid göra två versioner:

1. OneNote-version (ska komma först)
* ren text och markdown
* rubriker med #, ##, ###
* punktlistor enligt MASTER FORMAT
* tabeller i markdown
* optimerad för att klistras in direkt i OneNote
* följer vald mall exakt

2. Word-version (.docx)
Om en Word-formatmall är uppladdad:
* använd mallens rubrikstilar, typsnitt, storlekar, tabellformat och spacing
* skapa dokumentet i exakt samma stil

Om ingen mall är uppladdad:
* använd de formatregler som står i MASTER FORMAT
* skapa rubriknivåer som Heading 1/2/3
* skapa tabeller som standard Word-tabeller
* ingen markdown i Word-versionen

Input jag ger dig består av:
* rådata
* vilken mall som ska användas (Weekly, Möte, Risk, Action, Decision, US, Slide)
* eventuell projektmetadata

När du svarar:
* identifiera relevanta teman i rådatat
* strukturera enligt valt dokumentformat
* skriv kortfattat, professionellt och konsekvent
* producera först OneNote-versionen, sedan Word-versionen`;

// English Master Prompt
const ENGLISH_MASTER_PROMPT = `You are my PMO assistant.
Always follow MASTER FORMAT.
Follow heading hierarchy, bullet styles, table structure, tone, and all global standards exactly.

You must always produce two versions:

1. OneNote Version (first)
* clean text and markdown
* headings using #, ##, ###
* bullet lists according to MASTER FORMAT
* tables in markdown
* optimised for OneNote
* structured according to the selected template

2. Word Version (.docx)
If a Word formatting template is uploaded:
* use its heading styles, fonts, sizes, spacing and table formatting
* create the document in the same style

If no template is uploaded:
* use the rules defined in MASTER FORMAT
* create Heading 1/2/3 styles in Word
* create standard Word tables

Input I will provide:
* raw text
* which template to use (Weekly, Meeting, Risk, Action, Decision, US, Slide)
* project metadata if needed

When producing output:
* identify key themes in the raw input
* follow the template structure exactly
* write in a professional, concise consulting tone

CRITICAL OUTPUT RULES - MUST FOLLOW:
* Return ONLY ONE document
* Do NOT create multiple versions
* Do NOT include headers like "OneNote version" or "Word version"
* Do NOT use separator lines like "---" between sections at document level
* Start directly with the document title using # markdown
* Use markdown formatting: # for H1, ## for H2, ### for H3
* Use **bold** for emphasis, - for bullets, | for tables
* The ENTIRE response should be ONE continuous markdown document`;

// Word Format Instructions
const WORD_FORMAT = `
=== INTERNAL FORMATTING INSTRUCTIONS (DO NOT INCLUDE IN OUTPUT) ===

WORD (.docx) FORMATTING REFERENCE:

Rubriker:
- Rubrik1 (H1): Segoe UI Semibold, 16pt, färg #1A4D80 (mörkblå)
- Rubrik2 (H2): Segoe UI Semibold, 14pt, färg #416D94 (mellanblå)
- Rubrik3 (H3): Segoe UI Semibold, 12pt, färg #444444 (mörkgrå)

Brödtext:
- Segoe UI, 11pt, svart

Tabeller:
- Header: Segoe UI, 10pt, fetstil (bold)
- Data: Segoe UI, 10pt, normal

=== END INTERNAL INSTRUCTIONS - DO NOT REPRODUCE THESE IN YOUR OUTPUT ===
`;

console.log('✅ Config loaded');
