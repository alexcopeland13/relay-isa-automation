-- Add BoldTrail contact ID column to leads_v2 table
ALTER TABLE leads_v2 
ADD COLUMN boldtrail_contact_id text;

-- Create index for fast lookups of BoldTrail contact IDs
CREATE INDEX leads_v2_boldtrail_contact_idx 
ON leads_v2 (boldtrail_contact_id);