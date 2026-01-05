-- Seed common IT skills for the taxonomy

-- Programming Languages
INSERT INTO skills (name, category, aliases, description, is_current) VALUES
('JavaScript', 'programming_language', ARRAY['JS', 'ECMAScript', 'ES6', 'ES2015'], 'Web programming language', true),
('TypeScript', 'programming_language', ARRAY['TS'], 'Typed superset of JavaScript', true),
('Python', 'programming_language', ARRAY['Python3', 'Py'], 'General-purpose programming language', true),
('Java', 'programming_language', ARRAY['J2EE', 'JavaSE', 'JavaEE'], 'Object-oriented programming language', true),
('C#', 'programming_language', ARRAY['CSharp', 'C Sharp', '.NET'], 'Microsoft programming language', true),
('Go', 'programming_language', ARRAY['Golang'], 'Google programming language', true),
('Rust', 'programming_language', ARRAY[], 'Systems programming language', true),
('Ruby', 'programming_language', ARRAY[], 'Dynamic programming language', true),
('PHP', 'programming_language', ARRAY[], 'Server-side scripting language', true),
('Scala', 'programming_language', ARRAY[], 'JVM programming language', true),
('Kotlin', 'programming_language', ARRAY[], 'JVM programming language for Android', true),
('Swift', 'programming_language', ARRAY[], 'Apple programming language', true),
('SQL', 'programming_language', ARRAY['T-SQL', 'PL/SQL'], 'Database query language', true)
ON CONFLICT (name) DO NOTHING;

-- Frontend Frameworks
INSERT INTO skills (name, category, aliases, description, is_current) VALUES
('React', 'framework', ARRAY['ReactJS', 'React.js'], 'Frontend JavaScript library', true),
('Vue.js', 'framework', ARRAY['Vue', 'VueJS'], 'Frontend JavaScript framework', true),
('Angular', 'framework', ARRAY['Angular2+', 'AngularJS'], 'Frontend TypeScript framework', true),
('Next.js', 'framework', ARRAY['NextJS', 'Next'], 'React framework for production', true),
('Svelte', 'framework', ARRAY['SvelteKit'], 'Frontend compiler framework', true),
('Redux', 'framework', ARRAY['React Redux'], 'State management library', true)
ON CONFLICT (name) DO NOTHING;

-- Backend Frameworks
INSERT INTO skills (name, category, aliases, description, is_current) VALUES
('Node.js', 'framework', ARRAY['NodeJS', 'Node'], 'JavaScript runtime', true),
('Express.js', 'framework', ARRAY['Express', 'ExpressJS'], 'Node.js web framework', true),
('Spring Boot', 'framework', ARRAY['Spring', 'SpringBoot'], 'Java application framework', true),
('Django', 'framework', ARRAY[], 'Python web framework', true),
('Flask', 'framework', ARRAY[], 'Python micro framework', true),
('FastAPI', 'framework', ARRAY[], 'Python async framework', true),
('ASP.NET', 'framework', ARRAY['ASP.NET Core', '.NET Core'], 'Microsoft web framework', true),
('Ruby on Rails', 'framework', ARRAY['Rails', 'RoR'], 'Ruby web framework', true),
('NestJS', 'framework', ARRAY['Nest'], 'Node.js TypeScript framework', true)
ON CONFLICT (name) DO NOTHING;

-- Databases
INSERT INTO skills (name, category, aliases, description, is_current) VALUES
('PostgreSQL', 'database', ARRAY['Postgres', 'PG'], 'Relational database', true),
('MySQL', 'database', ARRAY['MariaDB'], 'Relational database', true),
('MongoDB', 'database', ARRAY['Mongo'], 'NoSQL document database', true),
('Redis', 'database', ARRAY[], 'In-memory data store', true),
('Elasticsearch', 'database', ARRAY['ES', 'Elastic'], 'Search and analytics engine', true),
('DynamoDB', 'database', ARRAY[], 'AWS NoSQL database', true),
('Oracle', 'database', ARRAY['Oracle DB'], 'Enterprise relational database', true),
('SQL Server', 'database', ARRAY['MSSQL', 'Microsoft SQL Server'], 'Microsoft relational database', true),
('Cassandra', 'database', ARRAY[], 'Distributed NoSQL database', true)
ON CONFLICT (name) DO NOTHING;

-- Cloud Platforms
INSERT INTO skills (name, category, aliases, description, is_current) VALUES
('AWS', 'cloud', ARRAY['Amazon Web Services', 'Amazon AWS'], 'Amazon cloud platform', true),
('Azure', 'cloud', ARRAY['Microsoft Azure', 'Azure Cloud'], 'Microsoft cloud platform', true),
('GCP', 'cloud', ARRAY['Google Cloud', 'Google Cloud Platform'], 'Google cloud platform', true),
('Heroku', 'cloud', ARRAY[], 'Platform as a Service', true),
('Vercel', 'cloud', ARRAY[], 'Frontend cloud platform', true),
('Netlify', 'cloud', ARRAY[], 'Web hosting platform', true)
ON CONFLICT (name) DO NOTHING;

-- DevOps & Infrastructure
INSERT INTO skills (name, category, aliases, description, is_current) VALUES
('Docker', 'devops', ARRAY['Containers'], 'Container platform', true),
('Kubernetes', 'devops', ARRAY['K8s', 'K8'], 'Container orchestration', true),
('Terraform', 'devops', ARRAY['TF'], 'Infrastructure as Code', true),
('Ansible', 'devops', ARRAY[], 'Configuration management', true),
('Jenkins', 'devops', ARRAY[], 'CI/CD automation server', true),
('GitHub Actions', 'devops', ARRAY['GHA'], 'GitHub CI/CD', true),
('GitLab CI', 'devops', ARRAY['GitLab CI/CD'], 'GitLab CI/CD', true),
('CircleCI', 'devops', ARRAY[], 'CI/CD platform', true),
('Prometheus', 'devops', ARRAY[], 'Monitoring system', true),
('Grafana', 'devops', ARRAY[], 'Observability platform', true),
('ELK Stack', 'devops', ARRAY['Elastic Stack', 'Elasticsearch Logstash Kibana'], 'Logging stack', true)
ON CONFLICT (name) DO NOTHING;

-- Methodologies
INSERT INTO skills (name, category, aliases, description, is_current) VALUES
('Agile', 'methodology', ARRAY['Agile Methodology'], 'Agile development methodology', true),
('Scrum', 'methodology', ARRAY[], 'Agile framework', true),
('Kanban', 'methodology', ARRAY[], 'Lean workflow method', true),
('TDD', 'methodology', ARRAY['Test Driven Development'], 'Test-first development', true),
('BDD', 'methodology', ARRAY['Behavior Driven Development'], 'Behavior-first development', true),
('CI/CD', 'methodology', ARRAY['Continuous Integration', 'Continuous Deployment'], 'Continuous integration and deployment', true),
('DevOps', 'methodology', ARRAY[], 'Development and operations culture', true),
('Microservices', 'methodology', ARRAY['Microservice Architecture'], 'Distributed architecture pattern', true)
ON CONFLICT (name) DO NOTHING;

-- Testing Tools
INSERT INTO skills (name, category, aliases, description, is_current) VALUES
('Jest', 'framework', ARRAY[], 'JavaScript testing framework', true),
('Cypress', 'framework', ARRAY[], 'End-to-end testing framework', true),
('Selenium', 'framework', ARRAY[], 'Browser automation', true),
('JUnit', 'framework', ARRAY[], 'Java testing framework', true),
('PyTest', 'framework', ARRAY['pytest'], 'Python testing framework', true),
('Playwright', 'framework', ARRAY[], 'Browser automation', true)
ON CONFLICT (name) DO NOTHING;

-- Message Queues
INSERT INTO skills (name, category, aliases, description, is_current) VALUES
('Kafka', 'devops', ARRAY['Apache Kafka'], 'Event streaming platform', true),
('RabbitMQ', 'devops', ARRAY['Rabbit MQ'], 'Message broker', true),
('SQS', 'devops', ARRAY['Amazon SQS', 'AWS SQS'], 'AWS message queue', true)
ON CONFLICT (name) DO NOTHING;

-- API Technologies
INSERT INTO skills (name, category, aliases, description, is_current) VALUES
('REST', 'methodology', ARRAY['REST API', 'RESTful'], 'API architectural style', true),
('GraphQL', 'framework', ARRAY['GQL'], 'Query language for APIs', true),
('gRPC', 'framework', ARRAY[], 'High-performance RPC framework', true),
('WebSocket', 'framework', ARRAY['WebSockets', 'WS'], 'Real-time communication protocol', true)
ON CONFLICT (name) DO NOTHING;
