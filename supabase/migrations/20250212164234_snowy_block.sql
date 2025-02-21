/*
  # Create agent_responses table

  1. New Tables
    - `agent_responses`
      - `id` (uuid, primary key)
      - `agent_id` (text, not null)
      - `user_id` (uuid, not null, references profiles.id)
      - `prompt` (text)
      - `response` (text, not null)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `agent_responses` table
    - Add policy for authenticated users to read their own responses
    - Add policy for authenticated users to insert their own responses
*/

-- Create agent_responses table
CREATE TABLE IF NOT EXISTS agent_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id text NOT NULL,
  user_id uuid NOT NULL REFERENCES profiles(id),
  prompt text,
  response text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE agent_responses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own responses"
  ON agent_responses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own responses"
  ON agent_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS agent_responses_user_id_idx ON agent_responses(user_id);
CREATE INDEX IF NOT EXISTS agent_responses_agent_id_idx ON agent_responses(agent_id);