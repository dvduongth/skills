Workflow for the Project Idea Editor skill

1. Scan project

scan_project

Claude will:

- analyze source
- detect architecture
- list modules

2. Generate documentation

generate_tech_doc

Outputs:

document/TECH.md
document/ARCHITECTURE.md

3. Edit idea

edit_idea "<idea description>"

Claude will:

- analyze impact
- update GDD
- propose architecture changes

4. Approve design

approve_design

5. Generate code

generate_code_from_design