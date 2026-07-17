BEGIN;

CREATE TABLE alembic_version (
    version_num VARCHAR(32) NOT NULL, 
    CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
);

-- Running upgrade  -> 65c5b8765f98

CREATE TABLE users (
    id SERIAL NOT NULL, 
    name VARCHAR(100) NOT NULL, 
    email VARCHAR(255) NOT NULL, 
    password_hash VARCHAR(100) NOT NULL, 
    is_active BOOLEAN NOT NULL, 
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX ix_users_email ON users (email);

CREATE INDEX ix_users_id ON users (id);

INSERT INTO alembic_version (version_num) VALUES ('65c5b8765f98') RETURNING alembic_version.version_num;

-- Running upgrade 65c5b8765f98 -> b73fc9c3a206

CREATE TABLE profiles (
    id SERIAL NOT NULL, 
    user_id INTEGER NOT NULL, 
    headline TEXT, 
    summary TEXT, 
    skills TEXT, 
    education TEXT, 
    experience TEXT, 
    projects TEXT, 
    PRIMARY KEY (id), 
    FOREIGN KEY(user_id) REFERENCES users (id), 
    UNIQUE (user_id)
);

UPDATE alembic_version SET version_num='b73fc9c3a206' WHERE alembic_version.version_num = '65c5b8765f98';

-- Running upgrade b73fc9c3a206 -> 13a3146e7426

CREATE TABLE resumes (
    id SERIAL NOT NULL, 
    user_id INTEGER NOT NULL, 
    title VARCHAR(255) NOT NULL, 
    original_filename VARCHAR(255) NOT NULL, 
    file_path VARCHAR(500) NOT NULL, 
    parsed_text TEXT NOT NULL, 
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(user_id) REFERENCES users (id)
);

UPDATE alembic_version SET version_num='13a3146e7426' WHERE alembic_version.version_num = 'b73fc9c3a206';

-- Running upgrade 13a3146e7426 -> 7b5b46ecd1ae

CREATE TABLE user_education (
    id SERIAL NOT NULL, 
    user_id INTEGER NOT NULL, 
    institution VARCHAR(255) NOT NULL, 
    degree VARCHAR(100) NOT NULL, 
    start_year VARCHAR(20), 
    end_year VARCHAR(20), 
    PRIMARY KEY (id), 
    FOREIGN KEY(user_id) REFERENCES users (id)
);

CREATE TABLE user_experience (
    id SERIAL NOT NULL, 
    user_id INTEGER NOT NULL, 
    company VARCHAR(255) NOT NULL, 
    role VARCHAR(255) NOT NULL, 
    description TEXT, 
    PRIMARY KEY (id), 
    FOREIGN KEY(user_id) REFERENCES users (id)
);

CREATE TABLE user_projects (
    id SERIAL NOT NULL, 
    user_id INTEGER NOT NULL, 
    title VARCHAR(100) NOT NULL, 
    description TEXT NOT NULL, 
    tech_stack TEXT, 
    github_url VARCHAR(500), 
    live_url VARCHAR(500), 
    PRIMARY KEY (id), 
    FOREIGN KEY(user_id) REFERENCES users (id)
);

CREATE TABLE user_skills (
    id SERIAL NOT NULL, 
    user_id INTEGER NOT NULL, 
    skill_name VARCHAR(100) NOT NULL, 
    PRIMARY KEY (id), 
    FOREIGN KEY(user_id) REFERENCES users (id)
);

ALTER TABLE profiles DROP COLUMN skills;

ALTER TABLE profiles DROP COLUMN education;

ALTER TABLE profiles DROP COLUMN projects;

ALTER TABLE profiles DROP COLUMN experience;

UPDATE alembic_version SET version_num='7b5b46ecd1ae' WHERE alembic_version.version_num = '13a3146e7426';

-- Running upgrade 7b5b46ecd1ae -> 2a8bbb1b087f

ALTER TABLE profiles ADD COLUMN full_name VARCHAR(150);

ALTER TABLE profiles ADD COLUMN phone VARCHAR(20);

ALTER TABLE profiles ADD COLUMN location VARCHAR(150);

ALTER TABLE profiles ADD COLUMN linkedin_url VARCHAR(255);

ALTER TABLE profiles ADD COLUMN github_url VARCHAR(255);

ALTER TABLE profiles ADD COLUMN portfolio_url VARCHAR(255);

ALTER TABLE profiles ALTER COLUMN headline TYPE VARCHAR(150);

UPDATE alembic_version SET version_num='2a8bbb1b087f' WHERE alembic_version.version_num = '7b5b46ecd1ae';

-- Running upgrade 2a8bbb1b087f -> 993a967ba7f3

ALTER TABLE user_experience ADD COLUMN start_month VARCHAR(20);

ALTER TABLE user_experience ADD COLUMN start_year INTEGER;

ALTER TABLE user_experience ADD COLUMN end_month VARCHAR(20);

ALTER TABLE user_experience ADD COLUMN end_year INTEGER;

ALTER TABLE user_experience ADD COLUMN currently_working BOOLEAN DEFAULT false NOT NULL;

UPDATE alembic_version SET version_num='993a967ba7f3' WHERE alembic_version.version_num = '2a8bbb1b087f';

-- Running upgrade 993a967ba7f3 -> fc5b0191d6e9

CREATE TABLE interview_sessions (
    id SERIAL NOT NULL, 
    user_id INTEGER NOT NULL, 
    resume_id INTEGER NOT NULL, 
    company VARCHAR(255), 
    role VARCHAR(255), 
    job_description TEXT NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
    PRIMARY KEY (id), 
    FOREIGN KEY(resume_id) REFERENCES resumes (id) ON DELETE CASCADE, 
    FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX ix_interview_sessions_id ON interview_sessions (id);

CREATE TABLE interview_questions (
    id SERIAL NOT NULL, 
    session_id INTEGER NOT NULL, 
    category VARCHAR(50) NOT NULL, 
    question TEXT NOT NULL, 
    difficulty VARCHAR(20) NOT NULL, 
    tip JSONB, 
    answer JSONB, 
    key_points JSONB, 
    common_mistakes JSONB, 
    follow_up_questions JSONB, 
    bookmarked BOOLEAN NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
    PRIMARY KEY (id), 
    FOREIGN KEY(session_id) REFERENCES interview_sessions (id) ON DELETE CASCADE
);

CREATE INDEX ix_interview_questions_id ON interview_questions (id);

CREATE TABLE interview_answers (
    id SERIAL NOT NULL, 
    question_id INTEGER NOT NULL, 
    user_answer TEXT NOT NULL, 
    overall_score FLOAT, 
    technical_score FLOAT, 
    communication_score FLOAT, 
    confidence_score FLOAT, 
    feedback TEXT, 
    improved_answer TEXT, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
    PRIMARY KEY (id), 
    FOREIGN KEY(question_id) REFERENCES interview_questions (id) ON DELETE CASCADE
);

CREATE INDEX ix_interview_answers_id ON interview_answers (id);

UPDATE alembic_version SET version_num='fc5b0191d6e9' WHERE alembic_version.version_num = '993a967ba7f3';

-- Running upgrade fc5b0191d6e9 -> 1d9d6257b4df

ALTER TABLE interview_questions ADD COLUMN estimated_duration VARCHAR(30);

ALTER TABLE interview_questions ADD COLUMN details_generated BOOLEAN;

ALTER TABLE interview_sessions ADD COLUMN candidate_type VARCHAR(20);

UPDATE interview_sessions SET candidate_type = 'FRESHER';

ALTER TABLE interview_sessions ALTER COLUMN candidate_type SET NOT NULL;

UPDATE alembic_version SET version_num='1d9d6257b4df' WHERE alembic_version.version_num = 'fc5b0191d6e9';

-- Running upgrade 1d9d6257b4df -> 9eda89821769

ALTER TABLE interview_questions ADD COLUMN tech_skill VARCHAR(100);

ALTER TABLE interview_questions DROP COLUMN key_points;

ALTER TABLE interview_questions DROP COLUMN tip;

ALTER TABLE interview_questions DROP COLUMN common_mistakes;

ALTER TABLE interview_questions DROP COLUMN follow_up_questions;

UPDATE alembic_version SET version_num='9eda89821769' WHERE alembic_version.version_num = '1d9d6257b4df';

-- Running upgrade 9eda89821769 -> d718a1b664eb

CREATE TABLE interview_question_bank (
    id SERIAL NOT NULL, 
    question TEXT NOT NULL, 
    answer TEXT NOT NULL, 
    skill VARCHAR(100) NOT NULL, 
    category VARCHAR(50) NOT NULL, 
    experience_level VARCHAR(50) NOT NULL, 
    company VARCHAR(100), 
    role VARCHAR(100), 
    tags JSONB NOT NULL, 
    source VARCHAR(20) NOT NULL, 
    approved BOOLEAN NOT NULL, 
    created_by INTEGER, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
    PRIMARY KEY (id), 
    FOREIGN KEY(created_by) REFERENCES users (id) ON DELETE SET NULL
);

CREATE INDEX ix_interview_question_bank_id ON interview_question_bank (id);

UPDATE alembic_version SET version_num='d718a1b664eb' WHERE alembic_version.version_num = '9eda89821769';

-- Running upgrade d718a1b664eb -> 54179255e3cd

ALTER TABLE interview_question_bank ADD COLUMN status VARCHAR(20) DEFAULT 'Pending' NOT NULL;

UPDATE interview_question_bank SET status='Approved' WHERE approved=true;

UPDATE interview_question_bank SET status='Pending' WHERE approved=false;

ALTER TABLE interview_question_bank DROP COLUMN approved;

UPDATE alembic_version SET version_num='54179255e3cd' WHERE alembic_version.version_num = 'd718a1b664eb';

-- Running upgrade 54179255e3cd -> 89ecaaa10dd2

ALTER TABLE interview_question_bank DROP COLUMN status;

UPDATE alembic_version SET version_num='89ecaaa10dd2' WHERE alembic_version.version_num = '54179255e3cd';

-- Running upgrade 89ecaaa10dd2 -> f5a6c73660e1

UPDATE alembic_version SET version_num='f5a6c73660e1' WHERE alembic_version.version_num = '89ecaaa10dd2';

-- Running upgrade f5a6c73660e1 -> 309c578a899a

CREATE TABLE user_jobs (
    id VARCHAR NOT NULL, 
    user_id VARCHAR NOT NULL, 
    job_id VARCHAR NOT NULL, 
    company_name VARCHAR NOT NULL, 
    job_title VARCHAR NOT NULL, 
    company_logo VARCHAR, 
    location VARCHAR, 
    employment_type VARCHAR, 
    apply_url TEXT, 
    posted_at VARCHAR, 
    status VARCHAR, 
    viewed_at TIMESTAMP WITH TIME ZONE, 
    applied_at TIMESTAMP WITH TIME ZONE, 
    interview_date TIMESTAMP WITH TIME ZONE, 
    source VARCHAR, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
    updated_at TIMESTAMP WITH TIME ZONE, 
    PRIMARY KEY (id)
);

CREATE INDEX ix_user_jobs_job_id ON user_jobs (job_id);

CREATE INDEX ix_user_jobs_user_id ON user_jobs (user_id);

CREATE TABLE interview_bookmarks (
    id SERIAL NOT NULL, 
    user_id INTEGER NOT NULL, 
    question_id INTEGER NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
    PRIMARY KEY (id), 
    FOREIGN KEY(question_id) REFERENCES interview_question_bank (id) ON DELETE CASCADE, 
    FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX ix_interview_bookmarks_id ON interview_bookmarks (id);

UPDATE alembic_version SET version_num='309c578a899a' WHERE alembic_version.version_num = 'f5a6c73660e1';

-- Running upgrade 309c578a899a -> 4c56955f6026

ALTER TABLE user_jobs ALTER COLUMN user_id TYPE INTEGER USING user_id::integer;

ALTER TABLE user_jobs ADD FOREIGN KEY(user_id) REFERENCES users (id) ON DELETE CASCADE;

UPDATE alembic_version SET version_num='4c56955f6026' WHERE alembic_version.version_num = '309c578a899a';

-- Running upgrade 4c56955f6026 -> eca40e1ba14e

CREATE TABLE job_cache (
    id VARCHAR NOT NULL, 
    job_id VARCHAR NOT NULL, 
    data JSONB NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX ix_job_cache_job_id ON job_cache (job_id);

CREATE TABLE search_cache (
    id VARCHAR NOT NULL, 
    query VARCHAR NOT NULL, 
    jobs_json JSONB NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(), 
    PRIMARY KEY (id)
);

CREATE UNIQUE INDEX ix_search_cache_query ON search_cache (query);

UPDATE alembic_version SET version_num='eca40e1ba14e' WHERE alembic_version.version_num = '4c56955f6026';

-- Running upgrade eca40e1ba14e -> 6d1b6a7d9f41

ALTER TABLE resumes ADD COLUMN file_content_base64 TEXT;

UPDATE alembic_version SET version_num='6d1b6a7d9f41' WHERE alembic_version.version_num = 'eca40e1ba14e';

-- Running upgrade 6d1b6a7d9f41 -> cd8a18eb1fdf

ALTER TABLE users ADD COLUMN provider VARCHAR(50) DEFAULT 'local';

ALTER TABLE users ADD COLUMN provider_id VARCHAR(255);

ALTER TABLE users ADD COLUMN avatar_url VARCHAR(1000);

ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

UPDATE alembic_version SET version_num='cd8a18eb1fdf' WHERE alembic_version.version_num = '6d1b6a7d9f41';

-- Running upgrade cd8a18eb1fdf -> 7a00de410ec4

UPDATE alembic_version SET version_num='7a00de410ec4' WHERE alembic_version.version_num = 'cd8a18eb1fdf';

-- Running upgrade 7a00de410ec4 -> ab605fd92200

ALTER TABLE resumes ADD COLUMN is_generated BOOLEAN;

UPDATE resumes SET is_generated = FALSE;

ALTER TABLE resumes ALTER COLUMN is_generated SET NOT NULL;

UPDATE alembic_version SET version_num='ab605fd92200' WHERE alembic_version.version_num = '7a00de410ec4';

-- Running upgrade ab605fd92200 -> 50fec7e968ff

ALTER TABLE resumes ADD COLUMN resume_json TEXT;

UPDATE alembic_version SET version_num='50fec7e968ff' WHERE alembic_version.version_num = 'ab605fd92200';

-- Running upgrade 50fec7e968ff -> b60835cd4f7e

ALTER TABLE resume_health_analyses ADD COLUMN canonical_hash VARCHAR(64);

ALTER TABLE resume_health_analyses ADD COLUMN scoring_version VARCHAR(20);

ALTER TABLE resume_health_analyses ADD COLUMN prompt_version VARCHAR(20);

ALTER TABLE resume_health_analyses ADD COLUMN analysis_type VARCHAR(20);

ALTER TABLE resume_health_analyses ADD COLUMN jd_hash VARCHAR(64);

ALTER TABLE resumes ADD COLUMN canonical_hash VARCHAR(64);

UPDATE alembic_version SET version_num='b60835cd4f7e' WHERE alembic_version.version_num = '50fec7e968ff';

-- Running upgrade b60835cd4f7e -> e34495bcd281

DROP INDEX ix_notifications_id;

DROP INDEX ix_notifications_is_read;

DROP INDEX ix_notifications_user_id;

DROP TABLE notifications;

UPDATE alembic_version SET version_num='e34495bcd281' WHERE alembic_version.version_num = 'b60835cd4f7e';

-- Running upgrade e34495bcd281 -> 85013c164c5d

DROP INDEX ix_user_settings_id;

DROP INDEX ix_user_settings_user_id;

DROP TABLE user_settings;

DROP INDEX ix_notifications_id;

DROP INDEX ix_notifications_is_read;

DROP INDEX ix_notifications_user_id;

DROP TABLE notifications;

UPDATE alembic_version SET version_num='85013c164c5d' WHERE alembic_version.version_num = 'e34495bcd281';

-- Running upgrade 85013c164c5d -> fe514d17d385

DROP INDEX ix_notifications_id;

DROP INDEX ix_notifications_is_read;

DROP INDEX ix_notifications_user_id;

DROP TABLE notifications;

DROP INDEX ix_user_settings_id;

DROP INDEX ix_user_settings_user_id;

DROP TABLE user_settings;

UPDATE alembic_version SET version_num='fe514d17d385' WHERE alembic_version.version_num = '85013c164c5d';

-- Running upgrade fe514d17d385 -> 0be4ff9ec53c

ALTER TABLE resumes ADD COLUMN parsing_status VARCHAR(50);

UPDATE alembic_version SET version_num='0be4ff9ec53c' WHERE alembic_version.version_num = 'fe514d17d385';

-- Running upgrade 0be4ff9ec53c -> d0cc9e38bc5f

ALTER TABLE interview_question_bank ADD COLUMN difficulty VARCHAR(20);

UPDATE interview_question_bank SET difficulty = 'Medium';

ALTER TABLE interview_question_bank ALTER COLUMN difficulty SET NOT NULL;

UPDATE alembic_version SET version_num='d0cc9e38bc5f' WHERE alembic_version.version_num = '0be4ff9ec53c';

COMMIT;

