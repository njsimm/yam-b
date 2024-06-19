\echo 'Delete and recreate yam db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE IF EXISTS yam;
CREATE DATABASE yam;
\connect yam

\i yam-schema.sql
\i yam-seed.sql
