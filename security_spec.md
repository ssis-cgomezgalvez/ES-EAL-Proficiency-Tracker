# Security Specification: EAL Student Assessment & Proficiency Tracker

## 1. Data Invariants
- Only authenticated users with verified Google accounts can access student educational records.
- EAL Teachers and Admins have full write permissions across student demographic profiles, WIDA score histories, proficiency assessments A-H, language profiles, and quarterly support records.
- Homeroom Teachers have read access to all students and limited edit capability on teacher observations, notes, and goals.
- Unauthenticated or non-whitelisted public requests are denied by default.
- IDs and string fields are strictly guarded with max-length constraints to prevent denial-of-wallet resource attacks.
- Bootstrapped administrator: cgomezgalvez@ssis.edu.vn.

## 2. The Dirty Dozen Payloads (Designed to Fail)
1. **Unauthenticated Read on /students**: Anonymous client requests list of students -> REJECTED (Missing auth).
2. **Payload Injection with Over-sized Field**: Student firstName string with >10,000 characters -> REJECTED (Exceeds size limit).
3. **Invalid Assessment Letter**: Assessment letter set to "Z" (allowed: A through H) -> REJECTED.
4. **Invalid WIDA Composite Out-of-Range**: Composite score set to 9.5 (max 6.0) -> REJECTED.
5. **Identity Spoofing in AssessedBy**: Non-admin user sets arbitrary creator ID -> REJECTED.
6. **Shadow Update on Student Record**: Updating with arbitrary `isAdmin: true` field injected -> REJECTED.
7. **Malformed ID in Document Path**: Submitting `/students/$$$malicious$$$` path -> REJECTED.
8. **Invalid Support Level Enum**: Support level set to "Unapproved" -> REJECTED.
9. **Quarter Enum Mutation**: Quarterly support with quarter="Q5" -> REJECTED.
10. **Tampering with User Profile Role**: Homeroom teacher attempting to promote themselves to admin -> REJECTED.
11. **Negative Score in Language Modality**: Writing score set to -1.0 -> REJECTED.
12. **Blanket Query without Valid Auth**: Public collection query on `language_profiles` -> REJECTED.
