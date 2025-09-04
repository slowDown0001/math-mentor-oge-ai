CREATE TABLE users (
    id          uuid PRIMARY KEY,               -- same id as auth provider (Supabase/Auth0/whatever)
    full_name   text,
    avatar_url  text,
    bio         text,
    created_at  timestamptz DEFAULT now(),
    updated_at  timestamptz DEFAULT now()
);
CREATE TABLE problems (
    id               uuid PRIMARY KEY,
    title            text,
    body             text,                      -- markdown or plain text
    body_image_url   text,
    solution         text,
    solution_steps   jsonb,                     -- [{step: "...", explanation: "..."}, ...]
    answer           text,
    code             text,                      -- human-readable topic code (e.g. 1.3.2)
    difficulty       smallint CHECK (difficulty BETWEEN 1 AND 5),
    calculator_ok    boolean DEFAULT true,
    created_at       timestamptz DEFAULT now()
);

-- Optional multiple-choice variant
CREATE TABLE mcq_options (
    id          uuid PRIMARY KEY,
    problem_id  uuid REFERENCES problems ON DELETE CASCADE,
    label       text,           -- "A", "B", …
    text        text            -- option body
);
CREATE TABLE skills (
    id          smallint PRIMARY KEY,           -- 1..181 (stable canonical ids)
    name        text,
    topic_code  text,
    parent_id   smallint REFERENCES skills      -- simple DAG
);

-- 1 row per user per skill
CREATE TABLE user_skill_states (
    user_id  uuid REFERENCES users ON DELETE CASCADE,
    skill_id smallint REFERENCES skills ON DELETE CASCADE,
    level    smallint CHECK (level BETWEEN 0 AND 100) DEFAULT 0,
    last_seen timestamptz DEFAULT now(),
    PRIMARY KEY (user_id, skill_id)
);
CREATE TABLE diagnostic_sessions (
    id            uuid PRIMARY KEY,
    user_id       uuid REFERENCES users ON DELETE CASCADE,
    started_at    timestamptz DEFAULT now(),
    finished_at   timestamptz,
    num_questions smallint,
    num_correct   smallint,
    final_difficulty smallint,
    status        text CHECK (status IN ('in_progress','completed','abandoned')) DEFAULT 'in_progress'
);

CREATE TABLE diagnostic_responses (
    id                uuid PRIMARY KEY,
    session_id        uuid REFERENCES diagnostic_sessions ON DELETE CASCADE,
    problem_id        uuid REFERENCES problems ON DELETE CASCADE,
    user_answer       text,
    correct_answer    text,
    is_correct        boolean,
    response_time_ms  integer,
    created_at        timestamptz DEFAULT now()
);
CREATE TYPE activity_type AS ENUM ('video','article','practice','quiz','unit_test');

CREATE TABLE activity_log (
    id              uuid PRIMARY KEY,
    user_id         uuid REFERENCES users ON DELETE CASCADE,
    type            activity_type NOT NULL,
    problem_id      uuid REFERENCES problems,   -- nullable for non-problem activities
    unit_number     smallint,
    subunit_number  smallint,
    points_earned   integer DEFAULT 0,
    minutes_spent   smallint DEFAULT 0,
    created_at      timestamptz DEFAULT now()
);

-- aggregated mastery per unit/subunit (materialised or updated by triggers)
CREATE TABLE user_mastery (
    user_id          uuid REFERENCES users ON DELETE CASCADE,
    unit_number      smallint,
    subunit_number   smallint,
    points_earned    integer DEFAULT 0,
    points_possible  integer DEFAULT 0,
    mastery_level    text CHECK (mastery_level IN
                     ('not_started','attempted','familiar','proficient','mastered')) DEFAULT 'not_started',
    updated_at       timestamptz DEFAULT now(),
    PRIMARY KEY (user_id, unit_number, coalesce(subunit_number,0))
);
CREATE TABLE user_streaks (
    user_id            uuid PRIMARY KEY REFERENCES users ON DELETE CASCADE,
    daily_goal_minutes integer  NOT NULL DEFAULT 30,
    current_streak     integer  NOT NULL DEFAULT 0,
    longest_streak     integer  NOT NULL DEFAULT 0,
    last_activity_date date,
    updated_at         timestamptz DEFAULT now()
);

CREATE TABLE daily_activity_summary (
    user_id  uuid REFERENCES users ON DELETE CASCADE,
    adate    date,
    minutes  integer DEFAULT 0,
    PRIMARY KEY (user_id, adate)
);
-- Articles / theory pages
CREATE TABLE articles (
    id          uuid PRIMARY KEY,
    skill_id    smallint REFERENCES skills,
    title       text,
    body        text,
    image_urls  text[]
);

-- Marking rubric snippets (if you keep the “marking” micro-service)
CREATE TABLE marking_snippets (
    id       uuid PRIMARY KEY,
    body     text
);
CREATE INDEX idx_problems_code         ON problems(code);
CREATE INDEX idx_problems_difficulty   ON problems(difficulty);
CREATE INDEX idx_user_skill_states_uid ON user_skill_states(user_id);
CREATE INDEX idx_activity_log_uid      ON activity_log(user_id);
CREATE INDEX idx_daily_summary_uid     ON daily_activity_summary(user_id);