-- Migration: Move existing player goals and assists to 24/25 season
-- This migration takes all existing goals and assists from the Player table
-- and creates corresponding entries in the SeasonStats table for the 24/25 season

-- Insert existing player stats into SeasonStats table for 24/25 season
-- Only insert if the player has goals or assists and doesn't already have 24/25 stats
INSERT INTO SeasonStats (playerId, season, goals, assists, createdAt, updatedAt)
SELECT 
    p.id as playerId,
    '24/25' as season,
    p.goals,
    p.assists,
    datetime('now') as createdAt,
    datetime('now') as updatedAt
FROM Player p
WHERE (p.goals > 0 OR p.assists > 0)
AND NOT EXISTS (
    SELECT 1 
    FROM SeasonStats ss 
    WHERE ss.playerId = p.id 
    AND ss.season = '24/25'
); 