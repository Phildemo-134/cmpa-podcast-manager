-- Migration pour mettre à jour les status des épisodes
-- Remplacer les anciens status par les nouveaux

-- Mettre à jour les status existants
UPDATE episodes 
SET status = 'draft' 
WHERE status IN ('uploading', 'transcribing');

UPDATE episodes 
SET status = 'published' 
WHERE status = 'completed';

UPDATE episodes 
SET status = 'failed' 
WHERE status = 'error';

-- Modifier la contrainte de la colonne status
ALTER TABLE episodes 
DROP CONSTRAINT IF EXISTS episodes_status_check;

ALTER TABLE episodes 
ADD CONSTRAINT episodes_status_check 
CHECK (status IN ('draft', 'processing', 'published', 'failed'));

-- Mettre à jour les commentaires
COMMENT ON COLUMN episodes.status IS 'Status de l''épisode: draft, processing, published, failed';
