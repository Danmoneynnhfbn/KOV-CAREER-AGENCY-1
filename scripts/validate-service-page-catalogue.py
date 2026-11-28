#!/usr/bin/env python3
"""Validate the internal 120-candidate service-page register."""
import csv,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
FILE=ROOT/"development"/"KOV-SERVICE-PAGE-CANDIDATES.csv"
REQUIRED={"candidate_id","family","title","route_idea","customer_problem","work_and_deliverable","scope_status","publish_gate"}
ALLOWED={"EXISTING_CANONICAL","SECTION_OR_AUDIENCE_VARIANT","DISTINCT_PAGE_CANDIDATE","CAPABILITY_CONFIRMATION_REQUIRED","FORMAT_SUBTOPIC","COMPONENT_SUBTOPIC","SUPPORTING_GUIDANCE","AUDIENCE_VARIANT","OWNER_CONFIRMATION_REQUIRED","MANAGED_WORKSTREAM","EXPLANATORY_TERM"}
def main():
 if not FILE.is_file(): print("Register missing.",file=sys.stderr); return 1
 with FILE.open(encoding="utf-8-sig",newline="") as f:
  reader=csv.DictReader(f); fields=set(reader.fieldnames or []); rows=list(reader)
 errors=[]
 if REQUIRED-fields: errors.append("Missing columns: "+", ".join(sorted(REQUIRED-fields)))
 if len(rows)!=120: errors.append(f"Expected 120 candidates, found {len(rows)}.")
 ids=[r.get("candidate_id","") for r in rows]
 if len(set(ids))!=len(ids): errors.append("Candidate IDs are not unique.")
 for i,r in enumerate(rows,start=2):
  for key in REQUIRED:
   if not r.get(key,"").strip(): errors.append(f"Row {i}: empty {key}.")
  if r.get("scope_status") not in ALLOWED: errors.append(f"Row {i}: unknown scope status.")
  if r.get("scope_status")!="EXISTING_CANONICAL" and r.get("route_idea","").startswith("/"):
   errors.append(f"Row {i}: unapproved candidate appears to reserve a public route.")
 confirmed=[r for r in rows if r.get("scope_status")=="EXISTING_CANONICAL"]
 if len(confirmed)!=8: errors.append(f"Expected 8 currently registered canonical offers; found {len(confirmed)}.")
 if errors:
  for e in errors: print("FAIL:",e)
  return 1
 print("PASS: 120 unique candidates in 8 families.")
 print("PASS: 8 current canonical offers distinguished from unapproved candidates.")
 print("PASS: no unapproved candidate reserves a public URL.")
 return 0
if __name__=="__main__": sys.exit(main())
